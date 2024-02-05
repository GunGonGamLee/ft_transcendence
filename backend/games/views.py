import jwt
from rest_framework.views import APIView
from rest_framework import status
from rest_framework.response import Response
from django.http import JsonResponse
from users.models import User
from games.models import Game
from login.views import AuthUtils
from src.utils import get_request_body_value
from django.core.exceptions import BadRequest
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi


class GameView(APIView):
    @swagger_auto_schema(tags=['/api/games'],
                         operation_description="게임방 생성 API",
                         manual_parameters=[
                             openapi.Parameter('Authorization', openapi.IN_HEADER, description='Bearer JWT Token',
                                               type=openapi.TYPE_STRING), ],
                         request_body=openapi.Schema(
                             type=openapi.TYPE_OBJECT,
                             properties={'title': openapi.Schema(type=openapi.TYPE_STRING, description='게임방 제목'),
                                         'password': openapi.Schema(type=openapi.TYPE_STRING, description='비밀번호'),
                                         'mode': openapi.Schema(type=openapi.TYPE_STRING, description='게임 모드'),},
                             required=['title', 'password', 'mode']),
                         responses={
                                    201: 'CREATED',
                                    400: 'BAD_REQUEST',
                                    401: 'UNAUTHORIZED',
                                    404: 'NOT_FOUND',
                                    500: 'SERVER_ERROR'})
    def post(self, request):
        try:
            user = AuthUtils.validate_jwt_token_and_get_user(request)
            title = get_request_body_value(request, 'title')
            password = get_request_body_value(request, 'password')
            mode = self.check_mode(get_request_body_value(request, 'mode'))

            title = title if title else None
            password = password if password else None

            if (mode == 0 or mode == 1) and title is None:
                raise BadRequest
            elif self.is_title_already_exist(title) and title is not None:
                raise BadRequest
            else:
                game = Game.objects.create(title=title, password=password, mode=mode, status=0, manager=user)
                game.save()
                return Response(status=status.HTTP_201_CREATED)

        except jwt.ExpiredSignatureError:
            return JsonResponse({'error': 'Token has expired'}, status=status.HTTP_401_UNAUTHORIZED)
        except jwt.InvalidTokenError:
            return JsonResponse({'error': 'Invalid token'}, status=status.HTTP_401_UNAUTHORIZED)
        except User.DoesNotExist:
            return JsonResponse({'err_msg': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)
        except BadRequest:
            return Response(status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return JsonResponse({'error': e.__class__.__name__}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def check_mode(self, mode):
        if mode == "casual_1v1":
            return 0
        elif mode == "casual_tournament":
            return 1
        elif mode == "rank":
            return 2
        else:
            raise BadRequest

    def is_title_already_exist(self, title):
        existing_games = Game.objects.filter(title=title)
        return existing_games.exists()