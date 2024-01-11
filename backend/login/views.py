# login/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from drf_yasg.utils import swagger_auto_schema
from .serializers import GoogleLoginSerializer, FTLoginSerializer


class GoogleLoginView(APIView):
    @swagger_auto_schema(
        tags=["login"],
        responses={302: GoogleLoginSerializer()},
    )
    def get(self, request):
        response = validate_request(request)
        serializer = GoogleLoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return Response(serializer.data)


class FTLoginView(APIView):
    @swagger_auto_schema(
        tags=["login"],
        responses={
            e0
        },
    )
    def get(self, request):
        request_data = {
            'redirect_uri': f'https://{request.get_host()}/login/authorization'
        }
        serializer = FTLoginSerializer(data=request_data)
        serializer.is_valid(raise_exception=True)
        redirect_uri = serializer.validated_data['redirect_uri']
        response = Response(status=302)
        response['Location'] = redirect_uri
        return response
