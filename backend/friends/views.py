from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from users.models import User, Friend
from .serializers import FriendSerializer
from django.conf import settings
import jwt
from django.shortcuts import get_object_or_404
from drf_yasg import openapi
from drf_yasg.utils import swagger_auto_schema
from login.views import AuthUtils
from src.utils import *

class FriendsView(APIView):
    @swagger_auto_schema(
        tags=['/api/friends'],
        manual_parameters=[
            openapi.Parameter('Authorization', openapi.IN_HEADER, description='Bearer JWT Token', type=openapi.TYPE_STRING)],
        response={200: "OK", 400: "Bad Request", 500: "Internal Server Error"})
    def get(self, request):
        try:
            current_user = AuthUtils.validate_jwt_token_and_get_user(request)
        
            friends_relations = Friend.objects.filter(user_id=current_user).filter(status=Friend.ACCEPTED) \
            | Friend.objects.filter(friend_id=current_user).filter(status=Friend.ACCEPTED)

            friend_list = []
            for relation in friends_relations:
                friend = relation.friend_id if relation.user_id == current_user else relation.user_id
                friend_list.append(friend.nickname)

            response_data = {'friends': friend_list}
            return Response(response_data, status=status.HTTP_200_OK)
        
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
		
    # POST 요청 : 친구 추가 
    @swagger_auto_schema(
        tags=['/api/friends'],
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'nickname': openapi.Schema(type=openapi.TYPE_STRING, description='친구가 되어줄 닉네임')
            },
            required=['nickname']),
        manual_parameters=[
            openapi.Parameter('Authorization', openapi.IN_HEADER, description='Bearer JWT Token', type=openapi.TYPE_STRING)],
            response={200: "OK", 400: "Bad Request", 409: "Conflict", 500: "Internal Server Error"}
        )
    def post(self, request):
        try:
            current_user = AuthUtils.validate_jwt_token_and_get_user(request)

            requested_nickname = get_request_body_value(request, 'nickname')

            requested_friend = get_object_or_404(User, nickname=requested_nickname)
            if current_user == requested_friend:
                return Response({'error': 'Cannot add yourself as a friend'}, status=status.HTTP_400_BAD_REQUEST)
            if Friend.objects.filter(user_id=current_user, friend_id=requested_friend).exists() \
                or Friend.objects.filter(user_id=requested_friend, friend_id=current_user).exists():
                return Response({'error': 'Already friends or friend request pending'}, status=status.HTTP_409_CONFLICT)
        
            Friend.objects.create(user_id=current_user, friend_id=requested_friend, status=Friend.PENDING)
            return Response({'message': 'Friend request sent'}, status=status.HTTP_200_OK)

        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
class AcceptFriendView(APIView):
    @swagger_auto_schema(
        tags=['/api/friends/accept'],
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'nickname': openapi.Schema(type=openapi.TYPE_STRING, description='친구 요청한 닉네임')
            },
            required=['nickname']),
        manual_parameters=[
            openapi.Parameter('Authorization', openapi.IN_HEADER, description='Bearer JWT Token', type=openapi.TYPE_STRING),
            openapi.Parameter('content-type', openapi.IN_HEADER, description='application/json', type=openapi.TYPE_STRING), ],
            response={200: "OK", 400: "Bad Request", 404: "Not Found", 500: "Internal Server Error"}
        )
    
    def post(self, request):
        try:
            current_user = AuthUtils.validate_jwt_token_and_get_user(request)
            requested_nickname = get_request_body_value(request, 'nickname')
            requested_friend = get_object_or_404(User, nickname=requested_nickname)

            friend_request = Friend.objects.filter(user_id=requested_friend, friend_id=current_user, status=Friend.PENDING).first()
            if not friend_request:
                return Response({'error': 'No friend request pending'}, status=status.HTTP_404_NOT_FOUND)
            
            friend_request.status = Friend.ACCEPTED
            friend_request.save()

            return Response({'message': 'Friend request Accepted'}, status=status.HTTP_200_OK)
        
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class RejectFriendView(APIView):
    @swagger_auto_schema(
        tags=['/api/friends/reject'],
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'nickname': openapi.Schema(type=openapi.TYPE_STRING, description='친구 요청한 닉네임')
            },
            required=['nickname']),
        manual_parameters=[
            openapi.Parameter('Authorization', openapi.IN_HEADER, description='Bearer JWT Token', type=openapi.TYPE_STRING)],
            response={200: "OK", 400: "Bad Request", 404: "Not Found", 500: "Internal Server Error"}
        )
    
    def post(self, request):
        try:
            current_user = AuthUtils.validate_jwt_token_and_get_user(request)
            requested_nickname = get_request_body_value(request, 'nickname')
            requested_friend = get_object_or_404(User, nickname=requested_nickname)

            friend_request = Friend.objcets.filter(user_id=requested_friend, friend_id=current_user, status=Friend.PENDING).first()
            if not friend_request:
                return Response({'error': 'No friend request pending'}, status=status.HTTP_404_NOT_FOUND)
            friend_request.status = Friend.REJECTED
            friend_request.save()

            return Response({'message': 'Friend request rejected'}, status=status.HTTP_200_OK)

        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)