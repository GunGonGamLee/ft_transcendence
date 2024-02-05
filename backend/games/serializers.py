from rest_framework import serializers
from games.models import Game
from users.models import User
from src.choices import MODE_CHOICES_DICT, AVATAR_CHOICES_DICT


class UserSerializer(serializers.ModelSerializer):

    avatar_file_name = serializers.SerializerMethodField()
    class Meta:
        model = User
        fields = ['nickname', 'avatar_file_name', 'rating']

    def get_avatar_file_name(self, user):
        return AVATAR_CHOICES_DICT.get(user.avatar)


class GameRoomSerializer(serializers.ModelSerializer):

    manager = UserSerializer()
    player1 = UserSerializer()
    player2 = UserSerializer()
    player3 = UserSerializer()

    class Meta:
        model = Game
        fields = ['title', 'password', 'mode', 'manager', 'player1', 'player2', 'player3']

    def to_representation(self, instance):
        data = super().to_representation(instance)

        players_data = []
        player_data = data.get('manager')
        player_data['is_manager'] = True
        players_data.append(player_data)

        for player_key in ['player1', 'player2', 'player3']:
            player_data = data.get(player_key)
            if player_data:
                player_data['is_manager'] = False
                players_data.append(player_data)

        data['players'] = players_data
        del data['manager']
        del data['player1']
        del data['player2']
        del data['player3']

        return data
