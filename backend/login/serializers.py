from rest_framework import serializers


class VerificationCodeSerializer(serializers.Serializer):
    token = serializers.CharField()
    is_noob = serializers.CharField()
