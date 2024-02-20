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


class Map:
    """
    맵 정보를 담는 클래스

    Attributes:
    - width: float
    - height: float
    """
    width: float
    height: float


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
