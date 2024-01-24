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
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from .serializers import VerificationCodeSerializer
from rest_framework.response import Response
from django.core.exceptions import ValidationError
from src.exceptions import GetDataException
from requests.exceptions import RequestException


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
    @swagger_auto_schema(tags=['/api/login'], operation_description="소셜 로그인 창으로 페이지 redirect",
                         responses={302: "Redirect to Another Location"})
    def get(self, request):
        authorize_api_url = self.authorize_api
        client_id = self.client_id
        redirect_uri = self.redirect_uri
        scope = self.scope
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
    @swagger_auto_schema(tags=['/api/login'],
                         operation_description="사용자의 이메일로 2차 인증 코드를 보내는 API",
                         manual_parameters=[
                             openapi.Parameter('token', openapi.IN_QUERY, description="1일 뒤에 만료하는 JWT 토큰", type=openapi.TYPE_STRING)],
                         responses={302: "Redirect to Front Page",
                                    400: 'BAD_REQUEST'})
    def get(self, request):
        try:
            code = request.GET.get('code')
            access_token = self.get_access_token(code)
            email = self.get_email(access_token)
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            user = User.objects.create(email=email)
            user.save()
        except GetDataException as e:
            return JsonResponse({'err_msg': e.message_dict}, status=status.HTTP_400_BAD_REQUEST)
        except RequestException:
            return JsonResponse({'err_msg': 'get access token error'}, status=status.HTTP_400_BAD_REQUEST)
        finally:
            send_and_save_verification_code(user)
            auth_token = create_jwt_token(user, 3)
            target_url = EMAIL_AUTH_URI + "?" + urlencode({
                'token': auth_token,
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
            raise RequestException()
        return token_response.json().get('access_token')

    def get_email(self, access_token):
        userinfo_response = requests.get(self.userinfo_api, headers={'Authorization': f'Bearer {access_token}'})
        if userinfo_response.status_code != status.HTTP_200_OK:
            raise GetDataException('failed to get email')
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


def create_jwt_token(user, expiration_days):
    payload = {
        'user_email': user.email,
        'exp': datetime.utcnow() + timedelta(days=expiration_days),
    }
    token = jwt.encode(payload, SECRET_KEY, algorithm='HS256')
    return token.decode('utf-8') if isinstance(token, bytes) else token


def send_and_save_verification_code(user):
    verification_code = get_random_string(length=6)
    user.verification_code = verification_code
    user.save()

    mail_subject = '[ft_transcendence] 이메일 인증을 완료해주세요.'
    message = f'당신의 인증 코드는 {verification_code}입니다.'
    send_mail(mail_subject, message, DEFAULT_FROM_MAIL, [user.email])


class VerificationCodeView(APIView):
    @swagger_auto_schema(
        tags=['/api/login'],
        operation_description="유저가 입력한 2차 이메일 인증 코드를 검증 API",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={'verification_code': openapi.Schema(type=openapi.TYPE_STRING, description='2차 인증 코드')},
            required=['verification_code']),
        manual_parameters=[
            openapi.Parameter('Authorization', openapi.IN_HEADER, description='Bearer JWT Token', type=openapi.TYPE_STRING),
            openapi.Parameter('content-type', openapi.IN_HEADER, description='application/json', type=openapi.TYPE_STRING), ],
        responses={201: openapi.Response('Successful Response', schema=VerificationCodeSerializer),
                   400: 'Bad Request',
                   401: 'Bad Unauthorized',
                   404: 'NOT FOUND'})
    def post(self, request):
        try:
            email = AuthUtils.check_jwt_token(request)
            verification_code = AuthUtils.get_verification_code(request)
            user = User.objects.get(email=email)
            nickname = user.nickname
            is_noob = True if nickname is None else False

            if user.verification_code == verification_code:
                jwt_token = create_jwt_token(user, 7)

                data = {'token': jwt_token, 'is_noob': is_noob}
                serializer = VerificationCodeSerializer(data)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            else:
                return JsonResponse({'err_msg': '인증코드가 일치하지 않습니다.'}, status=status.HTTP_400_BAD_REQUEST)
        except jwt.ExpiredSignatureError:
            return JsonResponse({'error': 'Token has expired'}, status=status.HTTP_401_UNAUTHORIZED)
        except jwt.InvalidTokenError:
            return JsonResponse({'error': 'Invalid token'}, status=status.HTTP_401_UNAUTHORIZED)
        except ValidationError as e:
            return JsonResponse({'error': e.messages}, status=status.HTTP_401_UNAUTHORIZED)
        except User.DoesNotExist:
            return JsonResponse({'err_msg': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)


class VerificationCodeAgainView(APIView):
    def post(self, request):
        try:
            email = AuthUtils.check_jwt_token(request)
            user = User.objects.get(email=email)
            send_and_save_verification_code(user)
            auth_token = create_jwt_token(user, 1)
            return JsonResponse({'token': auth_token}, status=status.HTTP_200_OK)

        except jwt.ExpiredSignatureError:
            return JsonResponse({'error': 'Token has expired'}, status=status.HTTP_401_UNAUTHORIZED)
        except jwt.InvalidTokenError:
            return JsonResponse({'error': 'Invalid token'}, status=status.HTTP_401_UNAUTHORIZED)
        except ValidationError as e:
            return JsonResponse({'error': e.messages}, status=status.HTTP_401_UNAUTHORIZED)
        except User.DoesNotExist:
            return JsonResponse({'err_msg': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)


class AuthUtils:
    @staticmethod
    def check_jwt_token(request):
        authorization_header = request.headers.get('Authorization', '')
        if not authorization_header.startswith('Bearer '):
            raise ValidationError('Invalid authorization header')
        jwt_token = authorization_header[len('Bearer '):]
        decoded_token = jwt.decode(jwt_token, SECRET_KEY, algorithms=['HS256'])
        user_email = decoded_token.get('user_email')
        return user_email

    @staticmethod
    def get_verification_code(request):
        if request.content_type != 'application/json':
            raise ValidationError('Invalid content type')
        try:
            json_data = json.loads(request.body.decode('utf-8'))
        except json.JSONDecodeError:
            raise ValidationError('Invalid JSON data')
        return json_data.get('verification_code', '')
