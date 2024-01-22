from rest_framework.views import APIView
from django.shortcuts import redirect
from django.http import JsonResponse
import requests
from rest_framework import status
from users.models import User
import jwt
from datetime import datetime, timedelta
from django.conf import settings
from django.core.mail import send_mail
from django.utils.crypto import get_random_string
from decouple import AutoConfig


BASE_URL = 'http://localhost:8000/'
GOOGLE_CALLBACK_URI = BASE_URL + 'api/login/google/callback/'
INTRA42_CALLBACK_URI = BASE_URL + 'api/login/intra42/callback'
config = AutoConfig()
state = settings.STATE

GOOGLE_CLIENT_ID = settings.GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET = settings.GOOGLE_CLIENT_SECRET
GOOGLE_AUTHORIZE_API = settings.GOOGLE_AUTHORIZE_API

INTRA42_CLIENT_ID = settings.INTRA42_CLIENT_ID
INTRA42_CLIENT_SECRET = settings.INTRA42_CLIENT_SECRET
INTRA42_AUTHORIZE_API = settings.INTRA42_AUTHORIZE_API
INTRA42_TOKEN_API = settings.INTRA42_TOKEN_API
INTRA42_USERINFO_API = settings.INTRA42_USERINFO_API

SECRET_KEY = settings.SECRET_KEY
DEFAULT_FROM_MAIL = settings.DEFAULT_FROM_MAIL


class OAuthLoginView(APIView):
    def get(self, request):
        authorize_api_url = self.authorize_api
        client_id = self.client_id
        redirect_uri = self.redirect_uri
        scope = self.scope
        print(redirect_uri)
        target_url = f"{authorize_api_url}?client_id={client_id}&redirect_uri={redirect_uri}&response_type=code&scope={scope}"
        return redirect(target_url)


class GoogleLoginView(OAuthLoginView):
    authorize_api = GOOGLE_AUTHORIZE_API
    client_id = GOOGLE_CLIENT_ID
    redirect_uri = GOOGLE_CALLBACK_URI
    scope = 'https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile'


class Intra42LoginView(OAuthLoginView):
    authorize_api = INTRA42_AUTHORIZE_API
    client_id = INTRA42_CLIENT_ID
    redirect_uri = INTRA42_CALLBACK_URI
    scope = 'public'


class OAuthCallbackView(APIView):
    def get(self, request):
        code = request.GET.get('code')

        token_response = requests.post(
            self.token_api,
            data={
                "grant_type": "authorization_code",
                "client_id": self.client_id,
                "client_secret": self.client_secret,
                "code": code,
                "redirect_uri": self.redirect_uri
            }
        )
        error = token_response.json().get("error")
        if error is not None:
            return JsonResponse({'err_msg': error}, status=status.HTTP_400_BAD_REQUEST)

        access_token = token_response.json().get('access_token')

        userinfo_response = requests.get(self.userinfo_api, headers={'Authorization': f'Bearer {access_token}'})
        if userinfo_response.status_code != 200:
            return JsonResponse({'err_msg': 'failed to get email'}, status=status.HTTP_400_BAD_REQUEST)

        email = userinfo_response.json().get('email')
        username = email.split('@')[0]

        try:
            user = User.objects.get(email=email)

        except User.DoesNotExist:
            user = User.objects.create(email=email, username=username)
            user.save()

        finally:
            send_verification_code(user)
            return JsonResponse({'msg': '이메일을 확인하고 인증 코드를 입력해주세요.'})


class GoogleCallbackView(OAuthCallbackView):
    client_id = GOOGLE_CLIENT_ID
    client_secret = GOOGLE_CLIENT_SECRET
    token_api = "https://oauth2.googleapis.com/token"
    redirect_uri = GOOGLE_CALLBACK_URI
    userinfo_api = "https://www.googleapis.com/oauth2/v1/tokeninfo"


class Intra42CallbackView(OAuthCallbackView):
    client_id = INTRA42_CLIENT_ID
    client_secret = INTRA42_CLIENT_SECRET
    token_api = INTRA42_TOKEN_API
    redirect_uri = INTRA42_CALLBACK_URI
    userinfo_api = INTRA42_USERINFO_API


def create_jwt_token(user, expiration_minutes):
    payload = {
        'user_email': user.email,
        'exp': datetime.utcnow() + timedelta(minutes=expiration_minutes),
    }
    token = jwt.encode(payload, SECRET_KEY, algorithm='HS256')
    return token.decode('utf-8') if isinstance(token, bytes) else token


def send_verification_code(user):
    verification_code = get_random_string(length=6)
    user.verification_code = verification_code
    user.save()

    mail_subject = '[ft_transcendence] 이메일 인증을 완료해주세요.'
    message = f'당신의 인증 코드는 {verification_code}입니다.'
    send_mail(mail_subject, message, DEFAULT_FROM_MAIL, [user.email])
    auth_token = create_jwt_token(user, 3)

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