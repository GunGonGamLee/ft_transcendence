from rest_framework import serializers
from users.models import User
from games.models import GameRecordView


class UserMeInfoSerializer(serializers.ModelSerializer):

    avatar = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['nickname', 'avatar']

    @staticmethod
    def get_avatar(user):
        return str(user.avatar).split('/')[-1]


class UserInfoSerializer(serializers.ModelSerializer):

    avatar = serializers.SerializerMethodField()
    custom_1v1_win_rate = serializers.SerializerMethodField()
    custom_tournament_win_rate = serializers.SerializerMethodField()
    rank_win_rate = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['nickname', 'avatar', 'rating', 'custom_1v1_win_rate', 'custom_tournament_win_rate', 'rank_win_rate']

    @staticmethod
    def get_avatar(user):
        return str(user.avatar).split('/')[-1]

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
