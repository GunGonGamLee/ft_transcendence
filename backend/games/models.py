import random
from datetime import datetime

import numpy as np
from django.db import models
from users.models import User
from src.choices import MODE_CHOICES, STATUS_CHOICES, GAME_SETTINGS_DICT

from numpy.linalg import norm


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

class Bar:
    """
    바 정보를 담는 클래스. xy 좌표는 바의 좌상단을 기준으로 한다.

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

    def __init__(self, x, y):
        self.width = GAME_SETTINGS_DICT['bar']['width']
        self.height = GAME_SETTINGS_DICT['bar']['height']
        self.x = x
        self.y = y
        self.speed = GAME_SETTINGS_DICT['bar']['speed']

    def set_x_y(self, x, y):
        self.x = x
        self.y = y


class Player:
    """
    플레이어 정보를 담는 클래스

    Attributes:
    - user: User
    - score: int
    - bar: Bar
    """
    user: User
    score: int
    bar: Bar

    def __init__(self, user: User, score: int, bar: Bar):
        self.user = user
        self.score = score
        self.bar = bar


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

    def __init__(self, x, y):
        self.radius = GAME_SETTINGS_DICT['ball']['radius']
        self.x = x
        self.y = y
        self.speed = float(GAME_SETTINGS_DICT['ball']['speed'])
        self.direction = (self.get_direction_x(), random.uniform(-1, 1))

    def normalize_ball_direction(self):
        direction_list = np.array(self.direction)
        self.direction = tuple(direction_list / norm(direction_list))

    def set_direction(self, direction: tuple):
        if direction[0] > 1 or direction[0] < -1 or direction[1] > 1 or direction[1] < -1:
            raise ValueError('direction must be in range of -1 to 1')
        self.normalize_ball_direction()

    def set_speed(self, speed):
        self.speed = speed

    def set_x_y(self, x, y):
        self.x = x
        self.y = y

    def move(self):
        self.x += self.speed * self.direction[0]
        self.y += self.speed * self.direction[1]

    def is_ball_inside_bar_x(self, bar: Bar):
        """
        공이 바 안에 있는지 확인하는 함수. x 좌표를 기준으로 확인한다.
        :param bar: 바
        :type bar: Bar
        :return: x축 상에서 바 안에 있으면 True, 아니면 False
        :rtype: bool
        """
        left_point = self.x - self.radius
        right_point = self.x + self.radius
        return bar.x <= right_point and left_point <= bar.x + bar.width

    def is_ball_inside_bar_y(self, bar: Bar):
        """
        공이 바 안에 있는지 확인하는 함수. y 좌표를 기준으로 확인한다.
        :param bar: 바
        :type bar: Bar
        :return: y축 상에서 바 안에 있으면 True, 아니면 False
        :rtype: bool
        """
        top_point = self.y - self.radius
        bottom_point = self.y + self.radius
        return bar.y <= bottom_point and top_point <= bar.y + bar.height

    def is_ball_inside_bar(self, bar: Bar):
        """
        공이 바에 부딪혔는지 확인하는 함수. 바 안에 공이 들어가면 부딪힌 것으로 간주한다.
        :param bar: 바
        :type bar: Bar
        :return: 부딪혔으면 True, 아니면 False
        :rtype: bool
        """
        return self.is_ball_inside_bar_x(bar) and self.is_ball_inside_bar_y(bar)

    def is_ball_hit_wall(self, ping_pong_map: PingPongMap):
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
        if top_point <= 0:
            self.y += abs(top_point)
            return True
        elif bottom_point >= ping_pong_map.height:
            self.y -= abs(bottom_point - ping_pong_map.height)
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
        self.normalize_ball_direction()

    def is_goal_in(self, ping_pong_map: PingPongMap):
        """
        골인했는지 확인하는 함수
        :param ping_pong_map: 맵
        :type ping_pong_map: PingPongMap
        :return: 골인했으면 True, 아니면 False
        :rtype: list
        """
        if self.x <= 0:
            return [False, True]
        elif self.x >= ping_pong_map.width:
            return [True, False]
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
        self.speed = GAME_SETTINGS_DICT['ball']['speed']
        self.direction = (self.get_direction_x(), random.uniform(-1, 1))
        self.normalize_ball_direction()

    def get_direction_x(self):
        if random.uniform(0, 10000) % 2 == 0:
            return random.uniform(GAME_SETTINGS_DICT['ball']['dir_right']['start'],
                                  GAME_SETTINGS_DICT['ball']['dir_right']['end'])
        else:
            return random.uniform(GAME_SETTINGS_DICT['ball']['dir_left']['start'],
                                  GAME_SETTINGS_DICT['ball']['dir_left']['end'])
        return 1


class PingPongGame:
    """
    핑퐁 게임 정보를 담는 클래스

    Attributes:
    - player: Player
    - map: Map
    - ball: Ball
    - bar: Bar
    - started_at: datetime
    """
    left_side_player: Player
    right_side_player: Player
    ping_pong_map: PingPongMap
    ball: Ball
    started_at: datetime
    finished: False

    def __init__(self, ping_pong_map: PingPongMap, player1: User, player2: User):
        """
        Args:
        - ping_pong_map: PingPongMap
        """
        self.left_side_player = Player(
            player1,
            0,
            Bar(
                GAME_SETTINGS_DICT['bar']['width'],
                ping_pong_map.height / 2 - GAME_SETTINGS_DICT['bar']['height'] / 2
            )
        )
        self.right_side_player = Player(
            player2,
            0,
            Bar(
                ping_pong_map.width - GAME_SETTINGS_DICT['bar']['width'],
                ping_pong_map.height / 2 - GAME_SETTINGS_DICT['bar']['height'] / 2
            ),
        )
        self.ping_pong_map = ping_pong_map
        self.ball = Ball(ping_pong_map.width / 2, ping_pong_map.height / 2)
        self.finished = False
        self.started_at = None

    def update_score(self, whether_score_a_goal: list):
        """
        점수를 업데이트하는 함수
        :param whether_score_a_goal: 골을 넣었는지 확인하는 리스트. [왼쪽 플레이어, 오른쪽 플레이어]
        :type whether_score_a_goal: list
        :return: None
        :rtype: None
        """
        if whether_score_a_goal[0]:
            self.left_side_player.score += 1
        elif whether_score_a_goal[1]:
            self.right_side_player.score += 1
