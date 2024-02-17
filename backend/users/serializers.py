from rest_framework import serializers
from users.models import User
from games.models import GameRecordView


class UserMeInfoSerializer(serializers.ModelSerializer):

    avatar_file_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['nickname', 'avatar_file_name']

    @staticmethod
    def get_avatar_file_name(user):
        return str(user.avatar)


class UserInfoSerializer(serializers.ModelSerializer):

    avatar_file_name = serializers.SerializerMethodField()
    custom_1v1_win_rate = serializers.SerializerMethodField()
    custom_tournament_win_rate = serializers.SerializerMethodField()
    rank_win_rate = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['nickname', 'avatar_file_name', 'rating', 'custom_1v1_win_rate', 'custom_tournament_win_rate', 'rank_win_rate']

    @staticmethod
    def get_avatar_file_name(user):
        return str(user.avatar)

    @staticmethod
    def get_custom_1v1_win_rate(user):
        match = GameRecordView.objects.filter(user_id=user.id, mode=0).count()
        if match == 0:
            return 0
        wins = user.custom_1vs1_wins
        return wins / match * 100

    @staticmethod
    def get_custom_tournament_win_rate(user):
        match = GameRecordView.objects.filter(user_id=user.id, mode=1).count()
        if match == 0:
            return 0
        wins = user.custom_tournament_wins
        return wins / match * 100

    @staticmethod
    def get_rank_win_rate(user):
        match = GameRecordView.objects.filter(user_id=user.id, mode=2).count()
        if match == 0:
            return 0
        wins = user.rank_wins
        return wins / match * 100


class UserAvatarUploadSerializer(serializers.ModelSerializer):
    avatar = serializers.ImageField()

    class Meta:
        model = User
        fields = ['avatar']
