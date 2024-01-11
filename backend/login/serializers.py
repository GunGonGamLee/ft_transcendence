from rest_framework import serializers
from drf_yasg.utils import swagger_auto_schema


@swagger_auto_schema(
    tags=["login"],
)
class GoogleLoginSerializer(serializers.Serializer):
    def to_representation(self, instance):
        return {
            "access_token": instance["access_token"],
            "refresh_token": instance["refresh_token"],
            "user": {
                "id": instance["user"].id,
                "email": instance["user"].email,
                "name": instance["user"].name,
            },
        }


@swagger_auto_schema(
    tags=["login"],
)
class Login42Serializer(serializers.Serializer):
    def to_representation(self, instance):
        return {
            "access_token": instance["access_token"],
            "refresh_token": instance["refresh_token"],
            "user": {
                "id": instance["user"].id,
                "email": instance["user"].email,
                "name": instance["user"].name,
            },
        }