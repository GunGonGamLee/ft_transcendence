from rest_framework.views import APIView
from rest_framework.response import Response
from drf_yasg.utils import swagger_auto_schema
from .schema.responses import ft_login_response_schema
from django.shortcuts import redirect
import os
from django.http import JsonResponse
import requests
from rest_framework import status
from allauth.socialaccount.models import SocialAccount
from users.models import User
import jwt
from datetime import datetime, timedelta
from django.conf import settings
from django.core.mail import send_mail
from django.utils.crypto import get_random_string
from decouple import AutoConfig
from django.http import HttpResponse

BASE_URL = 'http://localhost:8000/'
GOOGLE_CALLBACK_URI = BASE_URL + 'api/login/google/callback/'
state = os.environ.get("STATE")
config = AutoConfig()


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
    if request.method == 'GET':
        authorize_api_url = config('GOOGLE_AUTHORIZE_API')
        client_id = config('GOOGLE_CLIENT_ID')
        scope = 'https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile'
        target_url = f'{authorize_api_url}?client_id={client_id}&redirect_uri={GOOGLE_CALLBACK_URI}&response_type=code&scope={scope}'
        return redirect(target_url)
    else:
        return HttpResponse(status=405)


def create_jwt_token(user):
    payload = {
        'user_email': user.email,
        'exp': datetime.utcnow() + timedelta(days=1),
    }
    token = jwt.encode(payload, settings.SECRET_KEY, algorithm='HS256')
    return token.decode('utf-8') if isinstance(token, bytes) else token


def create_2fa_token(user):
    payload = {
        'user_email': user.email,
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


def intra42_login(request):
    if request.method == 'GET':
        authorize_api_url = config('INTRA42_AUTHORIZE_API')
        client_id = config('INTRA42_CLIENT_ID')
        callback_uri = config('INTRA42_CALLBACK_URI')
        target_url = f"{authorize_api_url}?client_id={client_id}&redirect_uri={callback_uri}&response_type=code"
        return redirect(target_url)
    else:
        return HttpResponse(status=405)


class Intra42SignInCallBackView(APIView):
    @staticmethod
    def get(request):
        auth_code = request.GET.get('code')
        intra42_token_api = config('INTRA42_TOKEN_API')
        data = {
            'grant_type': 'authorization_code',
            'client_id': config('INTRA42_CLIENT_ID'),
            'client_secret': config('INTRA42_CLIENT_SECRET'),
            'code': auth_code,
            'redirect_uri': config('INTRA42_CALLBACK_URI')
        }
        token_response = requests.post(intra42_token_api, data=data)
        return JsonResponse(token_response.json(), safe=False)
