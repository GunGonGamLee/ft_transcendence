from rest_framework import serializers
from users.models import User
from src.choices import MODE_CHOICES_DICT, AVATAR_CHOICES_DICT


class UserInfoSerializer(serializers.ModelSerializer):

    avatar_file_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['nickname', 'avatar_file_name']

    def get_avatar_file_name(self, user):
        return AVATAR_CHOICES_DICT.get(user.avatar)
