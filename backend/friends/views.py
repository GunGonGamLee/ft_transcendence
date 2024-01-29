from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from users.models import User, Friend
from .serializers import FriendSerializer
from django.conf import settings
import jwt
from django.shortcuts import get_object_or_404
from src.exceptions import CustomException

class FriendsView(APIView):
    def get_user_from_token(request):
        token = request.headers.get('Authorization', '')
        if not token:
            raise CustomException('Authorization token is missing', status_code=status.HTTP_401_UNAUTHORIZED)
        try:
            decoded_data = jwt.decode(token.split(' ')[1], settings.SECRET_KEY, algorithms=['HS256'])
        except:
            raise CustomException('Authorization token is invalid', status_code=status.HTTP_401_UNAUTHORIZED)
        user_email = decoded_data.get('email')
        return User.objects.get(email=user_email)

    # GET 요청 : 친구 목록 조회
    def get(self, request):
        try:
            current_user_email = self.get_user_from_token(request)
            current_user = User.objects.get(email=current_user_email)
        
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
    def post(self, request):
        try:
            current_user_email = self.get_user_from_token(request)
            current_user = User.objects.get(email=current_user_email)

            requested_nickname = request.data.get('nickname')

            requested_friend = get_object_or_404(User, nickname=requested_nickname)
            if current_user == requested_friend:
                return Response({'error': 'Cannot add yourself as a friend'}, status=status.HTTP_400_BAD_REQUEST)
            if Friend.objects.filter(user_id=current_user, friend_id=requested_friend).exists() \
                or Friend.objects.filter(user_id=requested_friend, friend_id=current_user).exists():
                return Response({'error': 'Already friends or friend request pending'}, status=status.HTTP_400_BAD_REQUEST)
        
            Friend.objects.create(user_id=current_user, friend_id=requested_friend, status=Friend.PENDING)

        except CustomException as e:
            return Response({'error': str(e)}, stauts=e.status_code)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
        
class AcceptFriendView(APIView):
    def post(self, request):
        

class RejectFriendView(APIView):
    def post(self, request):