# login/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
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

def google_callback(request):
    client_id = os.environ.get('SOCIAL_AUTH_GOOGLE_CLIENT_ID')
    client_secret = os.environ.get('SOCIAL_AUTH_GOOGLE_SECRET')
    code = request.GET.get('code')

    token_req = requests.post(f"https://oauth2.googleapis.com/token?client_id={client_id}&client_secret={client_secret}&code={code}&grant_type=authorization_code&redirect_uri={GOOGLE_CALLBACK_URI}&state={state}")
    token_req_json = token_req.json()
    error = token_req_json.get("error")

    if error is not None:
        raise JSONDecodeError(error)
    
    access_token = token_req_json.get('access_token')

    email_req = requests.get(f"https://www.googleapis.com/oauth2/v1/tokeninfo?access_token={access_token}")
    email_req_status = email_req.status_code

    if email_req_status != 200:
        return JsonResponse({'err_msg': 'failed to get email'}, status=status.HTTP_400_BAD_REQUEST)
    
    email_req_json = email_req.json()
    email = email_req_json.get('email')

    try:
        user = User.objects.get(email=email)

        # FK로 연결되어 있는 socialaccount 테이블에서 해당 이메일의 유저가 있는지 확인
        social_user = SocialAccount.objects.get(user=user)

        # 있는데 구글계정이 아니어도 에러
        if social_user.provider != 'google':
            return JsonResponse({'err_msg': 'no matching social type'}, status=status.HTTP_400_BAD_REQUEST)

        # 이미 Google로 제대로 가입된 유저 => 로그인 & 해당 유저의 jwt 발급
        data = {'access_token': access_token, 'code': code}
        accept = requests.post(f"{BASE_URL}api/login/google/finish/", data=data)
        accept_status = accept.status_code

        # 뭔가 중간에 문제가 생기면 에러
        if accept_status != 200:
            return JsonResponse({'err_msg': 'failed to signin'}, status=accept_status)

        accept_json = accept.json()
        accept_json.pop('user', None)
        return JsonResponse(accept_json)

    except User.DoesNotExist:
        # 전달받은 이메일로 기존에 가입된 유저가 아예 없으면 => 새로 회원가입 & 해당 유저의 jwt 발급
        data = {'access_token': access_token, 'code': code}
        accept = requests.post(f"{BASE_URL}api/login/google/finish/", data=data)
        accept_status = accept.status_code

        # 뭔가 중간에 문제가 생기면 에러
        if accept_status != 200:
            return JsonResponse({'err_msg': 'failed to signup'}, status=accept_status)

        accept_json = accept.json()
        accept_json.pop('user', None)
        return JsonResponse(accept_json)

    except SocialAccount.DoesNotExist:
        return JsonResponse({'err_msg': 'email exists but not social user'}, status=status.HTTP_400_BAD_REQUEST)