import math
import random
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

class Racket:
    """
    라켓 정보를 담는 클래스. xy 좌표는 라켓의 좌상단을 기준으로 한다.

    Attributes:
    - width: float
    - height: float
    - x: float (좌상단 x 좌표)
    - y: float (좌상단 y 좌표)
    - speed: float
    """
    width: float
    height: float
    x: float
    y: float
    speed: float

    def __init__(self, width, height, x, y, speed):
        self.width = width
        self.height = height
        self.x = x
        self.y = y
        self.speed = speed

    def set_x_y(self, x, y):
        self.x = x
        self.y = y


class Player:
    """
    플레이어 정보를 담는 클래스

    Attributes:
    - user: User
    - score: int
    - racket: Racket
    """
    user: User
    score: int
    racket: Racket

    def __init__(self, user: User, score: int, racket: Racket):
        self.user = user
        self.score = score
        self.racket = racket


class PingPongMap:
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


class Ball:
    """
    공 정보를 담는 클래스

    Attributes:
    - radius: float
    - x: float
    - y: float
    - speed: float
    - direction: tuple
    """
    radius: float
    x: float
    y: float
    speed: float
    direction: tuple

    def __init__(self, radius, x, y):
        self.radius = radius
        self.x = x
        self.y = y
        self.speed = 10
        self.direction = (random.uniform(-1, 1), random.uniform(-1, 1))

    def set_direction(self, direction: tuple):
        if direction[0] > 1 or direction[0] < -1 or direction[1] > 1 or direction[1] < -1:
            raise ValueError('direction must be in range of -1 to 1')
        self.direction = direction

    def set_speed(self, speed):
        self.speed = speed

    def set_x_y(self, x, y):
        self.x = x
        self.y = y

    def move(self):
        self.x += self.speed * self.direction[0]
        self.y += self.speed * self.direction[1]

    def hit_racket(self, racket: Racket):
        """
        공이 라켓에 부딪혔는지 확인하는 함수
        :param racket: 라켓
        :type racket: Racket
        :return: 부딪혔으면 True, 아니면 False
        :rtype: bool
        """
        racket_hit_point_max_range = math.sqrt(pow(racket.width / 2, 2) + pow(racket.height / 2, 2)) + self.radius
        racket_hit_point_min_range = racket.width / 2 + self.radius
        racket_center_pos = (racket.x + racket.width / 2, racket.y + racket.height / 2)
        a = math.fabs(racket_center_pos[0] - self.x)
        b = math.fabs(racket_center_pos[1] - self.y)
        c = math.sqrt(pow(a, 2) + pow(b, 2))  # 피타고라스 정리를 이용하여 공과 라켓의 중심 사이의 거리를 구함
        if racket_hit_point_min_range <= c <= racket_hit_point_max_range:
            return True
        return False

    def hit_wall(self, ping_pong_map: PingPongMap):
        """
        공이 맵에 부딪혔는지 확인하는 함수
        :param ping_pong_map: 맵
        :type ping_pong_map: PingPongMap
        :return: 부딪혔으면 True, 아니면 False
        :rtype: bool
        """
        top_point = self.y - self.radius
        bottom_point = self.y + self.radius

        # 공이 벽에 부딪혔는지 확인
        if top_point <= 0 or bottom_point >= ping_pong_map.height:
            return True
        return False

    def bounce(self, bounce_direction=tuple):
        """
        공을 튕기는 함수
        :param bounce_direction: 튕길 방향
        :type bounce_direction: tuple
        """
        self.direction = (self.direction[0] * bounce_direction[0], self.direction[1] * bounce_direction[1])
        correction = random.uniform(0.9, 1.1)
        self.direction = (self.direction[0] * correction, self.direction[1] * correction)

    def is_goal_in(self, ping_pong_map: PingPongMap):
        """
        골인했는지 확인하는 함수
        :param ping_pong_map: 맵
        :type ping_pong_map: PingPongMap
        :return: 골인했으면 True, 아니면 False
        :rtype: list
        """
        if self.x < 0:
            return [True, False]
        elif self.x > ping_pong_map.width:
            return [False, True]
        else:
            return [False, False]

    def reset(self, ping_pong_map: PingPongMap):
        """
        공을 초기화하는 함수
        :param ping_pong_map: 맵
        :type ping_pong_map: PingPongMap
        :return: None
        :rtype: None
        """
        self.x = ping_pong_map.width / 2
        self.y = ping_pong_map.height / 2
        self.speed = 10
        self.direction = (random.uniform(-1, 1), random.uniform(-1, 1))


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
    left_side_player: Player
    right_side_player: Player
    ping_pong_map: PingPongMap
    ball: Ball
    started_at: datetime

    def __init__(self,
                 left_side_player: Player,
                 right_side_player: Player,
                 ping_pong_map: PingPongMap,
                 ball: Ball):
        """
        Args:
        - left_side_player: Player
        - right_side_player: Player
        - map: Map
        - ball: Ball
        - left_side_racket: Racket
        - right_side_racket: Racket
        """
        self.left_side_player = left_side_player
        self.right_side_player = right_side_player
        self.ping_pong_map = ping_pong_map
        self.ball = ball
        self.started_at = datetime.now()

    def update_score(self, whether_score_a_goal: list):
        """
        점수를 업데이트하는 함수
        :param whether_score_a_goal: 골을 넣었는지 확인하는 리스트
        :type whether_score_a_goal: list
        :return: None
        :rtype: None
        """
        if whether_score_a_goal[0]:
            self.right_side_player.score += 1
        elif whether_score_a_goal[1]:
            self.left_side_player.score += 1

    def move_ball(self):
        """
        공을 움직이는 함수
        :return: None
        :rtype: None
        """
        self.ball.move()
        if self.ball.hit_wall(self.ping_pong_map):
            self.ball.bounce((1, -1))
        elif self.ball.hit_racket(self.left_side_player.racket) or self.ball.hit_racket(self.right_side_player.racket):
            self.ball.bounce((-1, 1))
        if whether_score_a_goal := self.ball.is_goal_in(self.ping_pong_map):
            self.update_score(whether_score_a_goal)
            self.ball.reset(self.ping_pong_map)
