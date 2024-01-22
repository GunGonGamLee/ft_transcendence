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
from django.utils.http import urlencode
import json


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
EMAIL_AUTH_URI = 'https://localhost:443/api/auth/email'

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
        access_token = self.get_access_token(code)
        email = self.get_email(access_token)

        try:
            user = User.objects.get(email=email)
            is_noob = False

        except User.DoesNotExist:
            user = User.objects.create(email=email)
            user.save()
            is_noob = True

        finally:
            send_verification_code(user)
            auth_token = create_jwt_token(user, 3)
            target_url = EMAIL_AUTH_URI + "?" + urlencode({
                'token': auth_token,
                'is_noob': is_noob,
            })
            return redirect(target_url)

    def get_access_token(self, code):
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
        return token_response.json().get('access_token')

    def get_email(self, access_token):
        userinfo_response = requests.get(self.userinfo_api, headers={'Authorization': f'Bearer {access_token}'})
        if userinfo_response.status_code != status.HTTP_200_OK:
            return JsonResponse({'err_msg': 'failed to get email'}, status=status.HTTP_400_BAD_REQUEST)
        return userinfo_response.json().get('email')


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


class VerificationCodeView(APIView):
    def get_verification_code(self):
        if self.request.content_type != 'application/json':
            return JsonResponse({'error': 'Invalid content type'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            json_data = json.loads(self.request.body.decode('utf-8'))
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON data'}, status=status.HTTP_400_BAD_REQUEST)
        return json_data.get('verification_code', '')

    def check_jwt_token(self):
        authorization_header = self.request.headers.get('Authorization', '')
        if not authorization_header.startswith('Bearer '):
            return JsonResponse({'error': 'Invalid Authorization header format'}, status=status.HTTP_400_BAD_REQUEST)
        jwt_token = authorization_header[len('Bearer '):]
        decoded_token = jwt.decode(jwt_token, SECRET_KEY, algorithms=['HS256'])
        user_email = decoded_token.get('user_email')
        return user_email

    def post(self, request):
        try:
            email = self.check_jwt_token()
            verification_code = self.get_verification_code()
        except jwt.ExpiredSignatureError:
            return JsonResponse({'error': 'Token has expired'}, status=status.HTTP_401_UNAUTHORIZED)
        except jwt.InvalidTokenError:
            return JsonResponse({'error': 'Invalid token'}, status=status.HTTP_401_UNAUTHORIZED)
