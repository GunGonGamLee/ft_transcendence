import jwt
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


class SetNicknameView(APIView):
    def post(self, request):
        try:
            user = AuthUtils.validate_jwt_token_and_get_user(request)
            nickname = get_request_body_value(request, 'nickname')
            user.nickname = nickname
            user.save()
            return Response(status=status.HTTP_201_CREATED)
        except jwt.ExpiredSignatureError:
            return JsonResponse({'error': 'Token has expired'}, status=status.HTTP_401_UNAUTHORIZED)
        except jwt.InvalidTokenError:
            return JsonResponse({'error': 'Invalid token'}, status=status.HTTP_401_UNAUTHORIZED)
        except ValidationError as e:
            return JsonResponse({'error': e.messages}, status=status.HTTP_401_UNAUTHORIZED)
        except User.DoesNotExist:
            return JsonResponse({'err_msg': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)
        except IntegrityError:
            return JsonResponse({'err_msg': 'duplicate nickname'}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return JsonResponse({'error': e.__class__.__name__}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
