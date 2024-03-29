import random

from django.core.exceptions import ValidationError
from django.db import IntegrityError
from django.http import JsonResponse
from drf_yasg import openapi
from drf_yasg.utils import swagger_auto_schema
from login.views import AuthUtils
from rest_framework import status, renderers
from rest_framework.parsers import MultiPartParser
from rest_framework.response import Response
from rest_framework.views import APIView
from src.choices import AVATAR_CHOICES_DICT
from src.exceptions import AuthenticationException
from src.utils import get_request_body_value
from users.models import User

from .serializers import UserMeInfoSerializer, UserInfoSerializer, UserAvatarUploadSerializer


class SetNicknameView(APIView):

    @swagger_auto_schema(
        tags=['/api/users'],
        operation_description="사용자 닉네임 저장 API",
        manual_parameters=[
            openapi.Parameter('Authorization', openapi.IN_HEADER, 'JWT Token', type=openapi.TYPE_STRING)],
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
            user.avatar = AVATAR_CHOICES_DICT[random.randint(0, 4)]
            user.save()
            return Response(status=status.HTTP_201_CREATED)
        except AuthenticationException as e:
            return JsonResponse({'error': e.messages}, status=status.HTTP_401_UNAUTHORIZED)
        except ValidationError as e:
            return JsonResponse({'error': e.messages}, status=status.HTTP_401_UNAUTHORIZED)
        except IntegrityError:
            return JsonResponse({'err_msg': 'duplicate nickname'}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return JsonResponse({
                'error': f"[{e.__class__.__name__}] {e}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


    @swagger_auto_schema(
        tags=['/api/users'],
        operation_description="사용자 닉네임 수정 API",
        manual_parameters=[
            openapi.Parameter('Authorization', openapi.IN_HEADER, 'JWT Token', type=openapi.TYPE_STRING)],
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
            return JsonResponse({
                'error': f"[{e.__class__.__name__}] {e}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class UserMeInfoView(APIView):
    @swagger_auto_schema(
        tags=['/api/users'],
        operation_description="사용자 정보 API",
        manual_parameters=[
            openapi.Parameter('Authorization', openapi.IN_HEADER, 'JWT Token', type=openapi.TYPE_STRING)],
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
            return JsonResponse({'error': str(e)}, status=status.HTTP_401_UNAUTHORIZED)
        except Exception as e:
            return JsonResponse({
                'error': f"[{e.__class__.__name__}] {e}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class UserInfoView(APIView):
    @swagger_auto_schema(
        tags=['/api/users'],
        operation_description="사용자 전적 API",
        manual_parameters=[
            openapi.Parameter('Authorization', openapi.IN_HEADER, 'JWT Token', type=openapi.TYPE_STRING)],
        responses={200: openapi.Response('Successful Response', schema=UserInfoSerializer),
                   401: 'Bad Unauthorized',
                   404: 'NOT FOUND',
                   500: 'SERVER_ERROR'})
    def get(self, request, nickname):
        try:
            AuthUtils.validate_jwt_token_and_get_user(request)
            user2 = User.objects.get(nickname=nickname)
            serializer = UserInfoSerializer(user2)
            return JsonResponse(serializer.data, status=status.HTTP_200_OK)
        except AuthenticationException as e:
            return JsonResponse({'error': str(e)}, status=status.HTTP_401_UNAUTHORIZED)
        except User.DoesNotExist:
            return JsonResponse({'err_msg': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return JsonResponse({
                'error': f"[{e.__class__.__name__}] {e}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class UserAvatarView(APIView):
    parser_classes = (MultiPartParser,)
    serializer_class = UserAvatarUploadSerializer
    renderer_classes = (renderers.JSONRenderer,)

    @swagger_auto_schema(
        tags=['/api/users'],
        operation_description="사용자 프로필 이미지 업로드 API",
        responses={200: 'Successful Response',
                   401: 'Bad Unauthorized',
                   500: 'SERVER_ERROR'},
        manual_parameters=[
            openapi.Parameter(
                'nickname',
                openapi.IN_PATH,
                type=openapi.TYPE_STRING,
                description='유저 닉네임',
                required=True),
            openapi.Parameter(
                'avatar',
                openapi.IN_FORM,
                type=openapi.TYPE_FILE,
                description='프로필 이미지',
                required=True
            ),
        ],
        content_type='multipart/form-data'
    )
    def post(self, request, nickname):
        try:
            avatar_file = request.FILES['avatar']
            user = AuthUtils.validate_jwt_token_and_get_user(request)
            if user.nickname != nickname:
                return JsonResponse(status=status.HTTP_401_UNAUTHORIZED, data={'error': 'Unauthorized'})
            user.avatar = avatar_file
            user.save(update_fields=['avatar'])
            return JsonResponse(status=status.HTTP_201_CREATED, data={'avatar': user.avatar.url})
        except Exception as e:
            return JsonResponse(status=status.HTTP_500_INTERNAL_SERVER_ERROR, data={'error': str(e)})

    @swagger_auto_schema(
        tags=['/api/users'],
        operation_description="사용자 프로필 이미지 변경 API",
        responses={200: 'Successful Response',
                   401: 'Bad Unauthorized',
                   500: 'SERVER_ERROR'},
        manual_parameters=[
            openapi.Parameter(
                'nickname',
                openapi.IN_PATH,
                type=openapi.TYPE_STRING,
                description='유저 닉네임',
                required=True),
            openapi.Parameter(
                'avatar',
                openapi.IN_QUERY,
                type=openapi.TYPE_STRING,
                description='기본 프로필 이미지 5개 중 하나',
                required=True,
                enum=list(AVATAR_CHOICES_DICT.values()),
            )
        ]
    )
    def patch(self, request, nickname):
        try:
            avatar = request.query_params.get('avatar')
            if avatar not in AVATAR_CHOICES_DICT.values():
                return JsonResponse(status=status.HTTP_400_BAD_REQUEST, data={'error': 'Invalid avatar'})
            user = AuthUtils.validate_jwt_token_and_get_user(request)
            if user.nickname != nickname:
                return JsonResponse(status=status.HTTP_401_UNAUTHORIZED, data={'error': 'Unauthorized'})
            user.avatar = avatar
            user.save(update_fields=['avatar'])
            return JsonResponse(status=status.HTTP_200_OK, data={'message': 'success'})
        except Exception as e:
            return JsonResponse(status=status.HTTP_500_INTERNAL_SERVER_ERROR, data={'error': str(e)})
