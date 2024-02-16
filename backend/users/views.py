import random
from rest_framework.views import APIView
from rest_framework import status
from rest_framework.response import Response
from django.http import JsonResponse
from users.models import User
from login.views import AuthUtils
from src.utils import get_request_body_value
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from django.db import IntegrityError
from django.core.exceptions import ValidationError
from .serializers import UserMeInfoSerializer, UserInfoSerializer
from src.exceptions import AuthenticationException


class SetNicknameView(APIView):
    @swagger_auto_schema(tags=['/api/users'],
                         operation_description="사용자 닉네임 저장 API",
                         request_body=openapi.Schema(
                             type=openapi.TYPE_OBJECT,
                             properties={'nickname': openapi.Schema(type=openapi.TYPE_STRING, description='닉네임')},
                             required=['nickname']),
                         responses={
                                    201: 'CREATED',
                                    400: 'BAD_REQUEST',
                                    401: 'UNAUTHORIZED',
                                    404: 'NOT_FOUND',
                                    500: 'SERVER_ERROR'})
    def post(self, request):
        try:
            user = AuthUtils.validate_jwt_token_and_get_user(request)
            nickname = get_request_body_value(request, 'nickname')
            user.nickname = nickname
            user.avatar = random.randint(0, 4)
            user.save()
            return Response(status=status.HTTP_201_CREATED)
        except AuthenticationException as e:
            return JsonResponse({'error': e.messages}, status=status.HTTP_401_UNAUTHORIZED)
        except ValidationError as e:
            return JsonResponse({'error': e.messages}, status=status.HTTP_401_UNAUTHORIZED)
        except IntegrityError:
            return JsonResponse({'err_msg': 'duplicate nickname'}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return JsonResponse({'error': f"[{e.__class__.__name__}] {e}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @swagger_auto_schema(tags=['/api/users'],
                         operation_description="사용자 닉네임 수정 API",
                         request_body=openapi.Schema(
                             type=openapi.TYPE_OBJECT,
                             properties={'nickname': openapi.Schema(type=openapi.TYPE_STRING, description='닉네임')},
                             required=['nickname']),
                         responses={
                                    200: 'OK',
                                    400: 'BAD_REQUEST',
                                    401: 'UNAUTHORIZED',
                                    404: 'NOT_FOUND',
                                    500: 'SERVER_ERROR'})
    def patch(self, request):
        try:
            user = AuthUtils.validate_jwt_token_and_get_user(request)
            nickname = get_request_body_value(request, 'nickname')
            user.nickname = nickname
            user.save()
            return Response(status=status.HTTP_200_OK)
        except AuthenticationException as e:
            return JsonResponse({'error': e.messages}, status=status.HTTP_401_UNAUTHORIZED)
        except ValidationError as e:
            return JsonResponse({'error': e.messages}, status=status.HTTP_401_UNAUTHORIZED)
        except IntegrityError:
            return JsonResponse({'err_msg': 'duplicate nickname'}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return JsonResponse({'error': f"[{e.__class__.__name__}] {e}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class UserMeInfoView(APIView):
    @swagger_auto_schema(
        tags=['/api/users'],
        operation_description="사용자 정보 API",
        responses={200: openapi.Response('Successful Response', schema=UserMeInfoSerializer),
                   401: 'Bad Unauthorized',
                   404: 'NOT FOUND',
                   500: 'SERVER_ERROR'})
    def get(self, request):
        try:
            user = AuthUtils.validate_jwt_token_and_get_user(request)
            serializer = UserMeInfoSerializer(user)
            return JsonResponse(serializer.data, status=status.HTTP_200_OK)
        except AuthenticationException as e:
            return JsonResponse({'error': e.messages}, status=status.HTTP_401_UNAUTHORIZED)
        except Exception as e:
            return JsonResponse({'error': f"[{e.__class__.__name__}] {e}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class UserInfoView(APIView):
    @swagger_auto_schema(
        tags=['/api/users'],
        operation_description="사용자 전적 API",
        responses={200: openapi.Response('Successful Response', schema=UserInfoSerializer),
                   401: 'Bad Unauthorized',
                   404: 'NOT FOUND',
                   500: 'SERVER_ERROR'})
    def get(self, request, nickname):
        try:
            user = AuthUtils.validate_jwt_token_and_get_user(request)
            user2 = User.objects.get(nickname=nickname)
            serializer = UserInfoSerializer(user2)
            return JsonResponse(serializer.data, status=status.HTTP_200_OK)
        except AuthenticationException as e:
            return JsonResponse({'error': e.messages}, status=status.HTTP_401_UNAUTHORIZED)
        except User.DoesNotExist:
            return JsonResponse({'err_msg': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return JsonResponse({'error': f"[{e.__class__.__name__}] {e}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
