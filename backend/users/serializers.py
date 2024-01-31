from rest_framework import serializers
from users.models import User


class UserInfoSerializer(serializers.ModelSerializer):
    AVATAR_CHOICES = {
        0: "red_bust",
        1: "blue_bust",
        2: "green_bust",
        3: "yellow_bust",
        4: "pink_bust",
    }

    avatar_file_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['nickname', 'avatar_file_name']

    def get_avatar_file_name(self, user):
        avatar_num = user.avatar
        return self.AVATAR_CHOICES.get(avatar_num)
