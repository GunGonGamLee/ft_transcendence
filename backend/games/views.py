import jwt
from rest_framework.views import APIView
from rest_framework import status
from rest_framework.response import Response
from django.http import JsonResponse
from users.models import User
from games.models import Game
from login.views import AuthUtils
from src.utils import get_request_body_value


class GameView(APIView):
    def post(self, request):
        try:
            user = AuthUtils.validate_jwt_token_and_get_user(request)
            title = get_request_body_value(request, 'title')
            password = get_request_body_value(request, 'password')
            mode = self.get_mode_num(get_request_body_value(request, 'mode'))

            title = title if title else None
            password = password if password else None

            game = Game.objects.create(title=title, password=password, mode=mode, status=0, manager=user)
            game.save()

        except jwt.ExpiredSignatureError:
            return JsonResponse({'error': 'Token has expired'}, status=status.HTTP_401_UNAUTHORIZED)
        except jwt.InvalidTokenError:
            return JsonResponse({'error': 'Invalid token'}, status=status.HTTP_401_UNAUTHORIZED)
        except User.DoesNotExist:
            return JsonResponse({'err_msg': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return JsonResponse({'error': e.__class__.__name__}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def get_mode_num(self, mode):
        if mode == "casual_1v1":
            return 0
        elif mode == "casual_tournament":
            return 1
        elif mode == "rank":
            return 2
        else:
            return None
