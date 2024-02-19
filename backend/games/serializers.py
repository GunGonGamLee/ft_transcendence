from rest_framework import serializers
from games.models import Game, GameRecordView, Result, CasualGameListView
from users.models import User


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['nickname', 'avatar', 'rating']


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


class GameRoomListSerializer(serializers.ModelSerializer):

    id = serializers.SerializerMethodField()
    title = serializers.SerializerMethodField()
    is_secret = serializers.SerializerMethodField()
    player_num = serializers.SerializerMethodField()
    started = serializers.SerializerMethodField()

    class Meta:
        model = CasualGameListView
        fields = ['id', 'title', 'is_secret', 'player_num', 'mode', 'started']

    def get_id(self, game):
        return game['game_id']

    def get_title(self, game):
        game = Game.objects.get(id=game['game_id'])
        return game.title

    def get_is_secret(self, game):
        game = Game.objects.get(id=game['game_id'])
        password = game.password
        if password is None:
            return False
        return True

    def get_player_num(self, game):
        game = Game.objects.get(id=game['game_id'])
        num = 0
        if game.manager is not None:
            num += 1
        if game.player1 is not None:
            num += 1
        if game.player2 is not None:
            num += 1
        if game.player3 is not None:
            num += 1
        return num

    def get_started(self, game):
        if game['status'] == 2:
            return True
        return False


class PvPResultListSerializer(serializers.ModelSerializer):

    id = serializers.SerializerMethodField()
    player1 = serializers.SerializerMethodField()
    player2 = serializers.SerializerMethodField()

    class Meta:
        model = GameRecordView
        fields = ['id', 'player1', 'player2']

    def __init__(self, *args, **kwargs):
        user_id = kwargs.pop('user_id', None)
        self.user_id = user_id
        super().__init__(*args, **kwargs)

    def get_id(self, game):
        return game['game_id']

    def get_player1(self, game):
        game_id = game['game_id']
        game = Game.objects.get(id=game_id)
        if self.user_id == game.manager.id:
            return UserSerializer(game.manager).data
        else:
            return UserSerializer(game.player1).data

    def get_player2(self, game):
        game_id = game['game_id']
        game = Game.objects.get(id=game_id)
        if self.user_id == game.manager.id:
            return UserSerializer(game.player1).data
        else:
            return UserSerializer(game.manager).data


class TournamentResultListSerializer(serializers.ModelSerializer):

    id = serializers.SerializerMethodField()
    date = serializers.SerializerMethodField()
    player = serializers.SerializerMethodField()

    class Meta:
        model = Game
        fields = ['id', 'date', 'player']

    def __init__(self, *args, **kwargs):
        user_id = kwargs.pop('user_id', None)
        self.user_id = user_id
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
            opponents_data.append(UserSerializer(player).data)
        data['opponents'] = opponents_data
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
                return UserSerializer(player).data


class PvPResultSerializer(serializers.ModelSerializer):

    player1 = serializers.SerializerMethodField()
    player2 = serializers.SerializerMethodField()
    start_time = serializers.SerializerMethodField()
    playtime = serializers.SerializerMethodField()

    class Meta:
        model = Game
        fields = ['player1', 'player2', 'start_time', 'playtime']

    def __init__(self, *args, **kwargs):
        user_id = kwargs.pop('user_id', None)
        self.user_id = user_id
        super().__init__(*args, **kwargs)

    def get_player1(self, game):
        match = game.match1
        score = None
        if self.user_id == match.player1.id:
            user = match.player1
            score = match.player1_score
        else:
            user = match.player2
            score = match.player2_score
        data = UserSerializer(user).data
        data['score'] = score
        if self.user_id == match.winner.id:
            data['winner'] = True
        else:
            data['winner'] = False
        return data

    def get_player2(self, game):
        match = game.match1
        score = None
        if self.user_id == match.player1.id:
            user = match.player2
            score = match.player2_score
        else:
            user = match.player1
            score = match.player1_score
        data = UserSerializer(user).data
        data['score'] = score
        if self.user_id == match.winner.id:
            data['winner'] = False
        else:
            data['winner'] = True
        return data

    def get_start_time(self, game):
        match = game.match1
        return match.started_at

    def get_playtime(self, game):
        match = game.match1
        return match.playtime


class MatchSerializer(serializers.ModelSerializer):

    player1 = serializers.SerializerMethodField()
    player2 = serializers.SerializerMethodField()

    class Meta:
        model = Result
        fields = ['player1', 'player2']

    def get_player1(self, match):
        data = UserSerializer(match.player1).data
        data['score'] = match.player1_score
        data['rating'] = match.player1.rating
        return data

    def get_player2(self, match):
        data = UserSerializer(match.player2).data
        data['score'] = match.player2_score
        data['rating'] = match.player2.rating
        return data


class TournamentResultSerializer(serializers.ModelSerializer):

    match1 = serializers.SerializerMethodField()
    match2 = serializers.SerializerMethodField()
    match3 = serializers.SerializerMethodField()

    class Meta:
        model = Game
        fields = ['match1', 'match2', 'match3']

    def get_match1(self, game):
        return MatchSerializer(game.match1).data

    def get_match2(self, game):
        return MatchSerializer(game.match2).data

    def get_match3(self, game):
        data = MatchSerializer(game.match3).data
        data['winner'] = game.match3.winner.nickname
        data['date'] = game.started_at
        return data
