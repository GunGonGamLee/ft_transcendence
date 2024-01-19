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
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.contrib.sites.shortcuts import get_current_site
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes
from django.utils.crypto import get_random_string

# 로그인이 성공했을 때 -> redirect_uri로 code 보내줌 -> 이건 클래스형 뷰로 만들었음
# 로그인 / 콜백 -> 함수로 만듦 -> 스웨거에 어떻게 쓰지?

BASE_URL = 'http://localhost:8000/'
GOOGLE_CALLBACK_URI = BASE_URL + 'api/login/google/callback/'
state = os.environ.get("STATE")

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
        'user_email': user.email,
        'exp': datetime.utcnow() + timedelta(days=1),
    }
    token = jwt.encode(payload, settings.SECRET_KEY, algorithm='HS256')
    return token.decode('utf-8') if isinstance(token, bytes) else token

def create_2fa_token(user):
    payload = {
        'user_email' : user.email,
        'exp': datetime.utcnow() + timedelta(minutes=3),
    }
    token = jwt.encode(payload, settings.SECRET_KEY, algorithm='HS256')
    return token.decode('utf-8') if isinstance(token, bytes) else token

def send_verification_code(user):
    verification_code = get_random_string(length=6)
    user.verification_code = verification_code
    user.save()

    mail_subject = '[ft_transcendence] 이메일 인증을 완료해주세요.'
    message = f'당신의 인증코드는 {verification_code}입니다.'
    send_mail(mail_subject, message, settings.DEFAULT_FROM_MAIL, [user.email])
    auth_token = create_2fa_token(user)

    return JsonResponse({'auth_token': auth_token, 'msg': '이메일을 확인하고 인증 코드를 입력하세요.'})


def verify_email(request):
    user_code = request.POST.get('code')
    email = request.POST.get('email')
    two_fa_token = request.POST.get('2fa_token')

    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return JsonResponse({'err_msg': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)
    
    if user.verification_code == user_code:
        is_verified = True
        user.save()

        jwt_token = create_jwt_token(user)
        return JsonResponse({'token': jwt_token, 'msg': '이메일 인증이 완료되었습니다.'})
    else:
        return JsonResponse({'err_msg': '인증코드가 일치하지 않습니다.'}, status=status.HTTP_400_BAD_REQUEST)

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
    google_user_id = email_req.json().get('user_id')
    username = email.split('@')[0]

    try:
        user = User.objects.get(email=email)
        social_user, created = SocialAccount.objects.get_or_create(
            user=user, provider='google', defaults={'uid': google_user_id}
        )
        if social_user.provider != 'google':
            return JsonResponse({'err_msg': 'no matching social type'}, status=status.HTTP_400_BAD_REQUEST)

        send_verification_code(user)
        return JsonResponse({'msg': '이메일을 확인하고 인증 코드를 입력해주세요.'})

    except User.DoesNotExist:
            # 새 사용자 생성 및 JWT 토큰 발급
        user = User.objects.create(email=email, username=username)
        SocialAccount.objects.get_or_create(
            user=user, provider='google', defaults={'uid': google_user_id}
        )
        user.save()

        send_verification_code(user)
        return JsonResponse({'msg': '회원가입을 위해 E-mail을 확인해주세요.'})


# 로그인을 (시도) 했다 -> 액세스토큰~~~~~~~ DB에 유저 정보가 저장된다. -> 이메일이 발송된다 -> JWT토큰(1차) 발급된다.
# 다시 발급받고 싶다(코드를) -> /api/login/mail -> 