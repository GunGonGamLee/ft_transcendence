from rest_framework import serializers
from games.models import Game, GameRecordView
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


class PlayerSerializer(serializers.Serializer):

    nickname = serializers.CharField()
    avatar = serializers.SerializerMethodField()
    rating = serializers.IntegerField()

    @staticmethod
    def get_avatar(user):
        return AVATAR_CHOICES_DICT.get(user.avatar)


class PvPResultSerializer(serializers.ModelSerializer):

    id = serializers.SerializerMethodField()
    player1 = serializers.SerializerMethodField()
    player2 = serializers.SerializerMethodField()

    class Meta:
        model = GameRecordView
        fields = ['id', 'player1', 'player2']

    def __init__(self, *args, **kwargs):
        user_id = kwargs.pop('user_id', None)
        total_pages = kwargs.pop('total_pages')
        self.user_id = user_id
        self.total_pages = total_pages
        super().__init__(*args, **kwargs)

    def get_id(self, game):
        return game['game_id']

    def get_player1(self, game):
        game_id = game['game_id']
        game = Game.objects.get(id=game_id)
        if self.user_id == game.manager.id:
            return PlayerSerializer(game.manager).data
        else:
            return PlayerSerializer(game.player1).data

    def get_player2(self, game):
        game_id = game['game_id']
        game = Game.objects.get(id=game_id)
        if self.user_id == game.manager.id:
            return PlayerSerializer(game.player1).data
        else:
            return PlayerSerializer(game.manager).data


class TournamentResultSerializer(serializers.ModelSerializer):

    id = serializers.SerializerMethodField()
    date = serializers.SerializerMethodField()
    player = serializers.SerializerMethodField()

    class Meta:
        model = Game
        fields = ['id', 'date', 'player']

    def __init__(self, *args, **kwargs):
        user_id = kwargs.pop('user_id', None)
        total_pages = kwargs.pop('total_pages')
        self.user_id = user_id
        self.total_pages = total_pages
        self.pos = None
        super().__init__(*args, **kwargs)

    def to_representation(self, instance):
        data = super().to_representation(instance)
        game = Game.objects.get(id=instance['game_id'])
        opponents_data = []
        players = [game.manager, game.player1, game.player2, game.player3]
        for i, player in enumerate(players):
            if i == self.pos:
                continue
            opponents_data.append(PlayerSerializer(player).data)
        data['opponents'] = opponents_data
        data['total_pages'] = self.total_pages
        return data

    def get_id(self, game):
        return game['game_id']

    def get_date(self, game):
        game = Game.objects.get(id=game['game_id'])
        return game.started_at

    def get_player(self, game):
        game_id = game['game_id']
        game = Game.objects.get(id=game_id)
        players = [game.manager, game.player1, game.player2, game.player3]
        for pos, player in enumerate(players):
            if self.user_id == player.id:
                self.pos = pos
                return PlayerSerializer(player).data
