import jwt
import random
from rest_framework.views import APIView
from rest_framework import status
from rest_framework.response import Response
from django.http import JsonResponse
from users.models import User
from games.models import Game, CasualGameView
from login.views import AuthUtils
from src.utils import get_request_body_value
from django.core.exceptions import BadRequest
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from django.db import transaction
from django.db.models import Min, Count
from games.serializers import GameRoomSerializer
from django.core.exceptions import ValidationError


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
                self.create_room(title, password, mode, user)
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

    @staticmethod
    def create_room(title, password, mode, user):
        game = Game.objects.create(title=title, password=password, mode=mode, status=0, manager=user)
        return game.id

    def check_mode(self, mode):
        if mode == "casual_1v1":
            return 0
        elif mode == "casual_tournament":
            return 1
        elif mode == "rank":
            return 2
        elif mode == "local_tournament":
            return 3
        else:
            raise BadRequest

    def is_title_already_exist(self, title):
        existing_games = Game.objects.filter(title=title)
        return existing_games.exists()


class GameRoomView(APIView):
    @swagger_auto_schema(tags=['/api/games'],
                         operation_description="게임방 입장 API",
                         manual_parameters=[
                             openapi.Parameter('Authorization', openapi.IN_HEADER, description='Bearer JWT Token',
                                               type=openapi.TYPE_STRING),
                             openapi.Parameter('game_id', openapi.IN_PATH, description='게임 방 id',
                                               type=openapi.TYPE_STRING),
                         ],
                         responses={
                             200: 'OK',
                             201: 'CREATED',
                             400: 'BAD_REQUEST',
                             401: 'UNAUTHORIZED',
                             404: 'NOT_FOUND',
                             409: 'CONFLICT',
                             500: 'SERVER_ERROR'})
    @transaction.atomic
    def post(self, request, game_id):
        try:
            user = AuthUtils.validate_jwt_token_and_get_user(request)
            game_id = int(game_id)

            if game_id == 0:    # 신속히 입장
                count = CasualGameView.objects.aggregate(Count('id'))
                if count == 0:
                    game_id = GameView.create_room("보보봉", None, random.choice([0, 1]), user)
                    game = Game.objects.get(id=game_id)
                    serializer = GameRoomSerializer(game)
                    return JsonResponse(serializer.data, status=status.HTTP_201_CREATED)
                else:
                    game_id = CasualGameView.objects.aggregate(Min('id'))['id__min']
                    game = Game.objects.get(id=game_id)
                    serializer = GameRoomSerializer(game)
                    return JsonResponse(serializer.data, status=status.HTTP_200_OK)
            else:
                game = Game.objects.get(id=game_id)
                if game.status != 0:
                    return Response({'error': '대기 중인 방이 아닙니다.'}, status=status.HTTP_400_BAD_REQUEST)
                if self.is_full(game):
                    return Response({'error': '꽉 찬 방입니다.'}, status=status.HTTP_409_CONFLICT)
                else:
                    self.enter_game(game, user)
                    serializer = GameRoomSerializer(game)
                    return JsonResponse(serializer.data, status=status.HTTP_200_OK)

        except jwt.ExpiredSignatureError:
            return JsonResponse({'error': 'Token has expired'}, status=status.HTTP_401_UNAUTHORIZED)
        except jwt.InvalidTokenError:
            return JsonResponse({'error': 'Invalid token'}, status=status.HTTP_401_UNAUTHORIZED)
        except User.DoesNotExist:
            return JsonResponse({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)
        except Game.DoesNotExist:
            return JsonResponse({'error': 'Game not found.'}, status=status.HTTP_404_NOT_FOUND)
        except ValueError:
            return Response(status=status.HTTP_400_BAD_REQUEST)
        except ValidationError as e:
            return JsonResponse({'error': e.messages}, status=status.HTTP_409_CONFLICT)
        except Exception as e:
            return JsonResponse({'error': e.__class__.__name__, 'message':str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def is_full(self, game):
        player1 = game.player1_id
        player2 = game.player2_id
        player3 = game.player3_id

        if player1 is not None and player2 is not None and player3 is not None:
            return True

    def enter_game(self, game, user):
        player1 = game.player1_id
        player2 = game.player2_id
        player3 = game.player3_id

        if player1 is None:
            game.player1 = user
            game.save()
        elif player2 is None:
            game.player2 = user
            game.save()
        elif player3 is None:
            game.player3 = user
            game.save()
        else:
            raise ValidationError('꽉 찬 방입니다.')

