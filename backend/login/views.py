# login/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from drf_yasg.utils import swagger_auto_schema
from .schema.responses import ft_login_response_schema, google_login_response_schema


class GoogleLoginView(APIView):
    @swagger_auto_schema(
        tags=["login"],
        operation_summary="구글 OAuth 로그인",
        operation_description="구글 OAuth 로그인 후 '/login/authorization'으로 리다이렉트",
        responses=google_login_response_schema,
    )
    def get(self, request):
        return Response(status=302, data={"message": "구글 OAuth 로그인"})


class FTLoginView(APIView):
    @swagger_auto_schema(
        tags=["login"],
        operation_id="42_login",
        operation_summary="42 OAuth 로그인",
        operation_description="42 OAuth 로그인 후 '/login/authorization'으로 리다이렉트",
        responses=ft_login_response_schema,
    )
    def get(self, request):
        return Response(status=302, data={"message": "42 OAuth 로그인"})

