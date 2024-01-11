from rest_framework import serializers
from drf_yasg.utils import swagger_auto_schema


class LoginRedirectSerializer(serializers.Serializer):
    status = serializers.IntegerField(default=302)
    redirect_uri = serializers.URLField(default='http://localhost:8000/login/authorization')


class GoogleLoginSerializer(LoginRedirectSerializer):
    pass


class FTLoginSerializer(LoginRedirectSerializer):
    pass
