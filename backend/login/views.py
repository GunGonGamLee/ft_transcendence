# login/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from drf_yasg.utils import swagger_auto_schema
from .schema.responses import ft_login_response_schema


class GoogleLoginView(APIView):
    @swagger_auto_schema(
        tags=["login"],
    )
    def get(self, request):

        # serializer = GoogleLoginSerializer(data=request.data)
        # serializer.is_valid(raise_exception=True)
        return Response('')


class FTLoginView(APIView):
    @swagger_auto_schema(
        tags=["login"],
        operation_id="42_login",
        operation_summary="42 OAuth 로그인",
        operation_description="42 OAuth 로그인 후 '/login/authorization'으로 리다이렉트",
        responses=ft_login_response_schema,
    )
    def get(self, request):
        return Response('')

