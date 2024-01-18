# login/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from django.contrib.auth import login
from drf_yasg.utils import swagger_auto_schema
from .schema.responses import ft_login_response_schema, google_login_response_schema
from django.shortcuts import redirect
import os
from json import JSONDecodeError
from django.http import JsonResponse
import requests
from rest_framework import status
from .models import *
from allauth.socialaccount.models import SocialAccount
from users.models import User
from allauth.socialaccount.providers.oauth2.client import OAuth2Client
from allauth.socialaccount.providers.google import views as google_view
from urllib.parse import urlencode
import jwt
from datetime import datetime, timedelta
from django.conf import settings


# 로그인이 성공했을 때 -> redirect_uri로 code 보내줌 -> 이건 클래스형 뷰로 만들었음
# 로그인 / 콜백 -> 함수로 만듦 -> 스웨거에 어떻게 쓰지?

BASE_URL = 'http://localhost:8000/'
GOOGLE_CALLBACK_URI = BASE_URL + 'api/login/google/callback/'
state = os.environ.get("STATE")

class GoogleLoginView(APIView):
    @swagger_auto_schema(
        tags=["login"],
        operation_summary="구글 OAuth 로그인",
        operation_description="구글 OAuth 로그인 후 '/login/google/finish'로 리다이렉트",
        responses=google_login_response_schema,
    )
    def get(self, request):
        scope = 'https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile'
        client_id = os.environ.get('SOCIAL_AUTH_GOOGLE_CLIENT_ID')
        redirect_uri = GOOGLE_CALLBACK_URI
        state = os.environ.get('STATE')

        google_auth_params = {
            'scope': scope,
            'client_id': client_id,
            'redirect_uri': redirect_uri,
            'state': state,
            'response_type': 'code',
            'prompt': 'select_account',
        }
        # 쿼리 파라미터를 url 인코딩
        google_auth_url = f'https://accounts.google.com/o/oauth2/v2/auth?{urlencode(google_auth_params)}'

        return redirect(google_auth_url)


class FTLoginView(APIView):
    @swagger_auto_schema(
        tags=["login"],
        operation_id="42_login",
        operation_summary="42 OAuth 로그인",
        operation_description="42 OAuth 로그인 후 '/login/42/finish'으로 리다이렉트",
        responses=ft_login_response_schema,
    )
    def get(self, request):
        return Response(status=302, data={"message": "42 OAuth 로그인"})
    
def google_login(request):
    scope = 'https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile'
    client_id = os.environ.get('SOCIAL_AUTH_GOOGLE_CLIENT_ID')
    return redirect(f'https://accounts.google.com/o/oauth2/v2/auth?client_id={client_id}&redirect_uri={GOOGLE_CALLBACK_URI}&response_type=code&scope={scope}')

def create_jwt_token(user):
    payload = {
        'user_id': user.id,
        'user_email': user.email,
        'exp': datetime.utcnow() + timedelta(days=1),
    }
    token = jwt.encode(payload, settings.SECRET_KEY, algorithm='HS256')
    return token.decode('utf-8') if isinstance(token, bytes) else token

def google_callback(request):
    client_id = os.environ.get('SOCIAL_AUTH_GOOGLE_CLIENT_ID')
    client_secret = os.environ.get('SOCIAL_AUTH_GOOGLE_SECRET')
    code = request.GET.get('code')

    # Google로부터 액세스 토큰 요청
    token_req = requests.post(
        "https://oauth2.googleapis.com/token",
        data={
            "client_id": client_id,
            "client_secret": client_secret,
            "code": code,
            "grant_type": "authorization_code",
            "redirect_uri": GOOGLE_CALLBACK_URI
        }
    )
    token_req_json = token_req.json()
    error = token_req_json.get("error")
    if error is not None:
        return JsonResponse({'err_msg': error}, status=status.HTTP_400_BAD_REQUEST)
    
    access_token = token_req_json.get('access_token')

    # Google API를 사용하여 이메일 정보 얻기
    email_req = requests.get(f"https://www.googleapis.com/oauth2/v1/tokeninfo?access_token={access_token}")
    if email_req.status_code != 200:
        return JsonResponse({'err_msg': 'failed to get email'}, status=status.HTTP_400_BAD_REQUEST)

    email = email_req.json().get('email')
    nickname = email.split('@')[0][:8] # 이메일 사용자를 그대로 갖고오지만, 8자로 제한한다

    try:
        user = User.objects.get(email=email)
        social_user = SocialAccount.objects.get(user=user)
        if social_user.provider != 'google':
            return JsonResponse({'err_msg': 'no matching social type'}, status=status.HTTP_400_BAD_REQUEST)

        # 사용자 로그인 처리 및 JWT 토큰 발급
        login(request, user)
        jwt_token = create_jwt_token(user)

        return JsonResponse({'token': jwt_token})

    except User.DoesNotExist:
        # 새 사용자 생성 및 JWT 토큰 발급
        user = User.objects.create(email=email, nickname=nickname)
        SocialAccount.objects.create(user=user, provider='google')
        login(request, user)
        jwt_token = create_jwt_token(user)

        return JsonResponse({'token': jwt_token})

    except SocialAccount.DoesNotExist:
        return JsonResponse({'err_msg': 'email exists but not social user'}, status=status.HTTP_400_BAD_REQUEST)