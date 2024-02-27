import random
from rest_framework.views import APIView
from rest_framework import status
from rest_framework.response import Response
from django.http import JsonResponse
from games.models import Game, CasualGameView, GameRecordView, CasualGameListView
from login.views import AuthUtils
from src.utils import get_request_body_value
from src.exceptions import BadRequest
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from django.db import transaction
from django.db.models import Min, Count
from games.serializers import GameRoomSerializer, PvPResultListSerializer, TournamentResultListSerializer, PvPResultSerializer, TournamentResultSerializer, GameRoomListSerializer
from django.core.exceptions import ValidationError
from src.exceptions import AuthenticationException, VerificationException
from users.models import User
from src.choices import MODE_CHOICES_DICT
from src.pagination_utils import PaginationUtils
from django.core.paginator import Paginator, EmptyPage
import logging
from src.choices import MODE_CHOICES_REVERSE_DICT
from django.contrib.auth.hashers import make_password


logger = logging.getLogger(__name__)


class GameView(APIView):
    @swagger_auto_schema(
        tags=['/api/games'],
        operation_description="게임방 목록 API",
        manual_parameters=[
            openapi.Parameter('Authorization', openapi.IN_HEADER, 'JWT Token', type=openapi.TYPE_STRING),
            openapi.Parameter('mode', openapi.IN_QUERY, '0: 1 vs 1, 1: 토너먼트, 2: 전체, defulat=2', type=openapi.TYPE_STRING),
            openapi.Parameter('page', openapi.IN_QUERY, '페이지 번호(미 입력시 1)', type=openapi.TYPE_INTEGER),
            openapi.Parameter('limit', openapi.IN_QUERY, '한 페이지 당 개수(미 입력시 4)', type=openapi.TYPE_INTEGER),
        ],
        responses={
            200: openapi.Response('OK', schema=GameRoomListSerializer),
            400: 'BAD_REQUEST',
            401: 'UNAUTHORIZED',
            404: 'NOT_FOUND',
            500: 'SERVER_ERROR'})
    def get(self, request):
        try:
            AuthUtils.validate_jwt_token_and_get_user(request)
            mode = self.validate_mode(request.GET.get('mode', 2))
            page = PaginationUtils.validate_page(request.GET.get('page', 1))
            limit = PaginationUtils.validate_limit(request.GET.get('limit', 4))
            queryset = None
            if mode == 0:
                queryset = CasualGameListView.objects.filter(mode=mode).values('game_id', 'mode', 'status').order_by('-game_id')
            elif mode == 1:
                queryset = CasualGameListView.objects.filter(mode=mode).values('game_id', 'mode', 'status').order_by('-game_id')
            elif mode == 2:
                queryset = CasualGameListView.objects.all().values('game_id', 'mode', 'status').order_by('-game_id')
            else:
                raise VerificationException('mode value is wrong')

            paginator = Paginator(queryset, limit)
            paginated_queryset = paginator.page(page)
            serializer = GameRoomListSerializer(
                instance=paginated_queryset,
                many=True
            )
            serialized_data_with_total_pages = {
                'total_pages': paginator.num_pages,
                'data': serializer.data
            }
            logging.info(f"[게임방 목록 API] mode : {mode}, page : {page}, limit : {limit}")
            return Response(serialized_data_with_total_pages, status=status.HTTP_200_OK)

        except AuthenticationException as e:
            return JsonResponse({'error': e.message}, status=status.HTTP_401_UNAUTHORIZED)
        except VerificationException as e:
            return JsonResponse({'error': e.message}, status=status.HTTP_400_BAD_REQUEST)
        except User.DoesNotExist:
            return JsonResponse({'error': 'user doesn\'t exist'}, status=status.HTTP_404_NOT_FOUND)
        except EmptyPage:
            return JsonResponse({'error': 'Page out of range'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return JsonResponse({'error': e.__class__.__name__, 'message': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @staticmethod
    def validate_mode(mode):
        try:
            if mode is None:
                raise VerificationException('mode value is wrong')
            mode = int(mode)
            return mode
        except Exception as e:
            raise VerificationException(f"[{e.__class__.__name__}] {e}")

    @swagger_auto_schema(
        tags=['/api/games'],
        operation_description="게임방 생성 API",
        manual_parameters=[
            openapi.Parameter('Authorization', openapi.IN_HEADER, 'JWT Token', type=openapi.TYPE_STRING)],
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
            password = make_password(password) if password else None

            if (mode == 0 or mode == 1) and title is None:
                raise BadRequest("title is required")
            elif self.is_title_already_exist(title) and title is not None:
                raise BadRequest("title is already exist")
            else:
                game_id = self.create_room(title, password, mode, user)
                return Response({'id': game_id}, status=status.HTTP_201_CREATED)
        except AuthenticationException as e:
            return JsonResponse({'error': e.message}, status=status.HTTP_401_UNAUTHORIZED)
        except BadRequest as e:
            return Response({'error': e.message}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return JsonResponse({'error': e.__class__.__name__, 'message': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @staticmethod
    def create_room(title, password, mode, user):
        game = Game.objects.create(title=title, password=password, mode=mode, status=0, manager=user)
        return game.id

    @staticmethod
    def check_mode(mode):
        logger.info(f"{mode}")
        logger.info(f"{MODE_CHOICES_REVERSE_DICT}")
        if mode in MODE_CHOICES_REVERSE_DICT:
            logger.info(f"{MODE_CHOICES_REVERSE_DICT[mode]}")
            return MODE_CHOICES_REVERSE_DICT[mode]
        else:
            raise ValueError("Invalid mode")

    @staticmethod
    def is_title_already_exist(title):
        existing_games = Game.objects.filter(title=title)
        return existing_games.exists()


class GameRoomView(APIView):
    @swagger_auto_schema(
        tags=['/api/games'],
        operation_description="게임방 입장 API",
        manual_parameters=[
            openapi.Parameter('Authorization', openapi.IN_HEADER, 'JWT Token', type=openapi.TYPE_STRING),
            openapi.Parameter('game_id', openapi.IN_PATH, '게임 방 id', type=openapi.TYPE_STRING),
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
                    self.enter_game(game, user, game.mode)
                    serializer = GameRoomSerializer(game)
                    return JsonResponse(serializer.data, status=status.HTTP_200_OK)
            else:
                game = Game.objects.get(id=game_id)
                if game.status != 0:
                    return Response({'error': '대기 중인 방이 아닙니다.'}, status=status.HTTP_400_BAD_REQUEST)
                if self.is_full(game, game.mode):
                    return Response({'error': '꽉 찬 방입니다.'}, status=status.HTTP_409_CONFLICT)
                else:
                    self.enter_game(game, user, game.mode)
                    serializer = GameRoomSerializer(game)
                    return JsonResponse(serializer.data, status=status.HTTP_200_OK)

        except AuthenticationException as e:
            return JsonResponse({'error': e.message}, status=status.HTTP_401_UNAUTHORIZED)
        except Game.DoesNotExist:
            return JsonResponse({'error': 'Game not found.'}, status=status.HTTP_404_NOT_FOUND)
        except ValueError:
            return JsonResponse({'error': 'Invalid game_id'}, status=status.HTTP_400_BAD_REQUEST)
        except ValidationError as e:
            return JsonResponse({'error': e.message}, status=status.HTTP_409_CONFLICT)
        except Exception as e:
            return JsonResponse({'error': e.__class__.__name__, 'message': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @staticmethod
    def is_full(game, mode):
        player1 = game.player1_id
        player2 = game.player2_id
        player3 = game.player3_id

        if mode == 0 and player1 is not None:
            return True
        if player1 is not None and player2 is not None and player3 is not None:
            return True
        return False

    @staticmethod
    def enter_game(game, user, mode):
        player1 = game.player1_id
        player2 = game.player2_id
        player3 = game.player3_id

        if mode == 0:
            if player1 is None:
                game.player1 = user
                game.status = 1
            else:
                raise ValidationError('꽉 찬 방입니다.')
        else:
            if player1 is None:
                game.player1 = user
                game.save()
            elif player2 is None:
                game.player2 = user
                game.save()
            elif player3 is None:
                game.player3 = user
                game.status = 1
                game.save()
            else:
                raise ValidationError('꽉 찬 방입니다.')


class GameResultListView(APIView):
    @swagger_auto_schema(
        tags=['/api/games'],
        operation_description="게임 전적 목록 API",
        manual_parameters=[
            openapi.Parameter('Authorization', openapi.IN_HEADER, 'JWT Token', type=openapi.TYPE_STRING),
            openapi.Parameter('user', openapi.IN_QUERY, '사용자 닉네임', type=openapi.TYPE_STRING),
            openapi.Parameter('mode', openapi.IN_QUERY, 'casual_1vs1, casual_tournament, rank', type=openapi.TYPE_STRING),
            openapi.Parameter('page', openapi.IN_QUERY, '페이지 번호', type=openapi.TYPE_INTEGER),
            openapi.Parameter('limit', openapi.IN_QUERY, '한 페이지 당 개수', type=openapi.TYPE_INTEGER),
        ],
        responses={
            200: 'OK (mode에 따라 응답이 달라집니다)',
            400: 'BAD_REQUEST',
            401: 'UNAUTHORIZED',
            404: 'NOT_FOUND',
            500: 'SERVER_ERROR'})
    def get(self, request):
        try:
            AuthUtils.validate_jwt_token_and_get_user(request)

            nickname = request.GET.get('user')
            if nickname is None:
                raise VerificationException('wrong user')
            user = User.objects.get(nickname=nickname)
            mode = self.validate_mode(request.GET.get('mode'))
            page = PaginationUtils.validate_page(request.GET.get('page', 1))
            limit = PaginationUtils.validate_limit(request.GET.get('limit', 4))

            serializer = None
            queryset = GameRecordView.objects.filter(mode=mode, user_id=user.id).values('game_id', 'mode', 'user_id').order_by('-started_at')
            paginator = Paginator(queryset, limit)
            paginated_queryset = paginator.page(page)

            if mode == 0:   # 1vs1
                serializer = PvPResultListSerializer(
                    instance=paginated_queryset,
                    user_id=user.id,
                    many=True
                )
            else:   # tournament
                serializer = TournamentResultListSerializer(
                    instance=paginated_queryset,
                    user_id=user.id,
                    many=True
                )
            serialized_data_with_total_pages = {
                'total_pages': paginator.num_pages,
                'data': serializer.data
            }
            return Response(serialized_data_with_total_pages, status=status.HTTP_200_OK)
        except AuthenticationException as e:
            return JsonResponse({'error': e.message}, status=status.HTTP_401_UNAUTHORIZED)
        except User.DoesNotExist:
            return JsonResponse({'error': 'user doesn\'t exist'}, status=status.HTTP_404_NOT_FOUND)
        except VerificationException as e:
            return JsonResponse({'error': e.message}, status=status.HTTP_400_BAD_REQUEST)
        except IndexError:
            return JsonResponse({'error': 'bad request(query parameter)'}, status=status.HTTP_400_BAD_REQUEST)
        except EmptyPage:
            return JsonResponse({'error': 'Page out of range'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return JsonResponse({'error': e.__class__.__name__, 'message': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @staticmethod
    def validate_mode(mode):
        try:
            if mode is None:
                raise VerificationException('mode value is wrong')
            mode_num = None
            for key, value in MODE_CHOICES_DICT.items():
                if value == mode:
                    mode_num = key
            if mode_num is None:
                raise VerificationException('mode value is wrong')
            if 0 <= mode_num <= 2:
                return mode_num
            else:
                raise VerificationException('mode value is wrong')
        except Exception as e:
            raise VerificationException(f"[{e.__class__.__name__}] {e}")


class GameResultView(APIView):
    @swagger_auto_schema(
        tags=['/api/games'],
        operation_description="게임 전적 API",
        manual_parameters=[
            openapi.Parameter('Authorization', openapi.IN_HEADER, 'JWT Token', type=openapi.TYPE_STRING),
            openapi.Parameter('user', openapi.IN_QUERY, '사용자 닉네임', type=openapi.TYPE_STRING),
        ],
        responses={
            200: 'OK (mode에 따라 응답이 달라집니다)',
            400: 'BAD_REQUEST',
            401: 'UNAUTHORIZED',
            500: 'SERVER_ERROR'})
    def get(self, request, game_id):
        try:
            AuthUtils.validate_jwt_token_and_get_user(request)
            nickname = request.GET.get('user')
            game = Game.objects.get(id=int(game_id))
            if nickname is None and game.mode == 0:
                raise VerificationException('Invalid user')
            serializer = None
            if game.mode == 0:
                user = User.objects.get(nickname=nickname)
                serializer = PvPResultSerializer(game, user_id=user.id, many=False)
            elif game.mode == 1 or game.mode == 2:
                serializer = TournamentResultSerializer(game, many=False)
            return Response(serializer.data, status=status.HTTP_200_OK)

        except AuthenticationException as e:
            return JsonResponse({'error': e.message}, status=status.HTTP_401_UNAUTHORIZED)
        except User.DoesNotExist:
            return JsonResponse({'error': 'user doesn\'t exist'}, status=status.HTTP_404_NOT_FOUND)
        except Game.DoesNotExist:
            return JsonResponse({'error': 'Game doesn\'t exist'}, status=status.HTTP_404_NOT_FOUND)
        except ValueError:
            return JsonResponse({'error': 'Invalid game_id'}, status=status.HTTP_400_BAD_REQUEST)
        except VerificationException as e:
            return JsonResponse({'error': e.message}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return JsonResponse({'error': e.__class__.__name__, 'message': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
