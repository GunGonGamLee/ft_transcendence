from datetime import datetime

from django.db import models
from users.models import User
from src.choices import MODE_CHOICES, STATUS_CHOICES


class Game(models.Model):
    mode = models.PositiveSmallIntegerField(choices=MODE_CHOICES)
    title = models.CharField(null=True, blank=True)
    password = models.CharField(null=True, blank=True)
    status = models.PositiveSmallIntegerField(choices=STATUS_CHOICES)
    manager = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    player1 = models.ForeignKey(User, related_name='player1_id', on_delete=models.SET_NULL, null=True, blank=True)
    player2 = models.ForeignKey(User, related_name='player2_id', on_delete=models.SET_NULL, null=True, blank=True)
    player3 = models.ForeignKey(User, related_name='player3_id', on_delete=models.SET_NULL, null=True, blank=True)
    match1 = models.ForeignKey('Result', related_name='result_match1', on_delete=models.SET_NULL, null=True, blank=True)
    match2 = models.ForeignKey('Result', related_name='result_match2', on_delete=models.SET_NULL, null=True, blank=True)
    match3 = models.ForeignKey('Result', related_name='result_match3', on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    started_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'games'


class Result(models.Model):
    winner = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    player1 = models.ForeignKey(User, related_name='result_player1', on_delete=models.SET_NULL, null=True, blank=True)
    player2 = models.ForeignKey(User, related_name='result_player2', on_delete=models.SET_NULL, null=True, blank=True)
    player1_score = models.PositiveSmallIntegerField(null=True, blank=True)
    player2_score = models.PositiveSmallIntegerField(null=True, blank=True)
    started_at = models.DateTimeField(null=True, blank=True)
    playtime = models.TimeField(null=True, blank=True)

    class Meta:
        db_table = 'results'


class RankGameView(models.Model):
    game_id = models.IntegerField(primary_key=True)

    class Meta:
        managed = False
        db_table = 'rank_game_view'


class CasualGameView(models.Model):
    game_id = models.IntegerField(primary_key=True)
    mode = models.PositiveSmallIntegerField()

    class Meta:
        managed = False
        db_table = 'casual_game_view'


class GameRecordView(models.Model):
    game_id = models.IntegerField()
    mode = models.IntegerField()
    user_id = models.IntegerField()
    started_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        managed = False
        db_table = 'game_record_view'


class CasualGameListView(models.Model):
    game_id = models.IntegerField(primary_key=True)
    mode = models.PositiveSmallIntegerField()
    status = models.PositiveSmallIntegerField()

    class Meta:
        managed = False
        db_table = 'casual_game_list_view'


##############################################################
# PingPong 게임 정보를 담는 클래스. 데이터베이스에 저장되지 않음.         #
##############################################################
class Player:
    """
    플레이어 정보를 담는 클래스

    Attributes:
    - user: User
    - score: int
    """
    user: User
    score: int

    def __init__(self, user, score):
        self.user = user
        self.score = score


class Ball:
    """
    공 정보를 담는 클래스

    Attributes:
    - radius: float
    - x: float
    - y: float
    - speed: float
    - direction: float
    """
    radius: float
    x: float
    y: float
    speed: float
    direction: float

    def __init__(self, radius, x, y, speed, direction):
        self.radius = radius
        self.x = x
        self.y = y
        self.speed = speed
        self.direction = direction


class Racket:
    """
    라켓 정보를 담는 클래스

    Attributes:
    - width: float
    - height: float
    - x: float
    - y: float
    """
    width: float
    height: float
    x: float
    y: float

    def __init__(self, width, height, x, y):
        self.width = width
        self.height = height
        self.x = x
        self.y = y


class Map:
    """
    맵 정보를 담는 클래스

    Attributes:
    - width: float
    - height: float
    """
    width: float
    height: float

    def __init__(self, width, height):
        self.width = width
        self.height = height


class PingPongGame:
    """
    핑퐁 게임 정보를 담는 클래스

    Attributes:
    - player: Player
    - map: Map
    - ball: Ball
    - racket: Racket
    - started_at: datetime
    """
    player: Player
    map: Map
    ball: Ball
    racket: Racket
    started_at: datetime

    def __init__(self, nickname: str, map_info: (float, float),
                 ball_info: (float, float, float), racket_info: (float, float, float, float)):
        """
        Args:
        :param nickname: 플레이어의 닉네임
        :type nickname: str
        :param map_info: 맵의 너비와 높이
        :type map_info: (float, float)
        :param ball_info: 공의 반지름, x좌표, y좌표
        :type ball_info: (float, float, float)
        :param racket_info: 라켓의 너비, 높이, x좌표, y좌표
        :type racket_info: (float, float, float, float)
        """
        self.player = Player(User.objects.get(nickname=nickname), 0)
        self.map = Map(map_info.width, map_info.height)
        self.ball = Ball(ball_info.radius, ball_info.x, ball_info.y, 0, 0)
        self.racket = Racket(racket_info.width, racket_info.height, racket_info.x, racket_info.y)
        self.started_at = datetime.now()
