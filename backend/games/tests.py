import random

import numpy as np
from django.test import TestCase
from games.models import PingPongGame, Ball, Bar, Player, PingPongMap
from users.models import User


class PingPongGameTestCase(TestCase):
    def setUp(self):
        self.left_side_player = User.objects.create_user(
            nickname='왼쪽',
            email='left@test.com',
        )
        self.right_side_player = User.objects.create_user(
            nickname='오른쪽',
            email='right@test.com',
        )
        ping_pong_map = PingPongMap(1920, 1080)
        self.ping_pong_game = PingPongGame(
            player1_nickname=self.left_side_player.nickname,
            player2_nickname=self.right_side_player.nickname,
            ping_pong_map=ping_pong_map,
        )

    def tearDown(self):
        self.left_side_player.delete()
        self.right_side_player.delete()

    def test_set_ball(self):
        before_direction = self.ping_pong_game.ball.direction
        self.ping_pong_game.ball.set_direction((-1, 0))
        self.ping_pong_game.ball.set_speed(10)
        self.ping_pong_game.ball.set_x_y(10, 10)
        self.assertNotEqual(before_direction, self.ping_pong_game.ball.direction)
        self.assertEqual(self.ping_pong_game.ball.speed, 10)
        self.assertEqual(self.ping_pong_game.ball.x, 10)
        self.assertEqual(self.ping_pong_game.ball.y, 10)

    def test_set_ball_direction_fail(self):
        direction = (random.uniform(1.1, 2), random.uniform(-1, 1))
        with self.assertRaises(ValueError):
            self.ping_pong_game.ball.set_direction(direction)

    def test_set_bar_position(self):
        self.ping_pong_game.left_side_player.bar.set_x_y(10, 10)
        self.assertEqual(self.ping_pong_game.left_side_player.bar.x, 10)
        self.assertEqual(self.ping_pong_game.left_side_player.bar.y, 10)

    def test_is_ball_inside_bar(self):
        ball_x = self.ping_pong_game.left_side_player.bar.x + self.ping_pong_game.left_side_player.bar.width
        ball_y = self.ping_pong_game.left_side_player.bar.y
        self.ping_pong_game.ball.set_x_y(ball_x, ball_y)
        self.assertEqual(self.ping_pong_game.ball.is_ball_inside_bar(
            self.ping_pong_game.left_side_player.bar,
        ), True)
        self.assertEqual(self.ping_pong_game.ball.is_ball_inside_bar(
            self.ping_pong_game.right_side_player.bar,
        ), False)

    def test_is_ball_hit_wall(self):
        ball_x = self.ping_pong_game.ping_pong_map.width / 2
        ball_y = 0
        self.ping_pong_game.ball.set_x_y(ball_x, ball_y)
        self.assertEqual(self.ping_pong_game.ball.is_ball_hit_wall(
            self.ping_pong_game.ping_pong_map
        ), True)

    def test_hit_nothing(self):
        self.assertEqual(self.ping_pong_game.ball.is_ball_hit_wall(
            self.ping_pong_game.ping_pong_map
        ), False)
        self.assertEqual(self.ping_pong_game.ball.is_ball_inside_bar(
            self.ping_pong_game.left_side_player.bar,
        ), False)
        self.assertEqual(self.ping_pong_game.ball.is_ball_inside_bar(
            self.ping_pong_game.right_side_player.bar,
        ), False)

    def test_move_ball(self):
        self.ping_pong_game.ball.move()
        self.assertNotEqual(self.ping_pong_game.ball.x, 0)
        self.assertNotEqual(self.ping_pong_game.ball.y, 0)

    def test_bounce(self):
        self.ping_pong_game.ball.set_direction((1, 1))
        self.ping_pong_game.ball.bounce((1, -1))
        self.assertNotEqual(self.ping_pong_game.ball.direction, (1, 1))

    def test_is_goal_in(self):
        self.ping_pong_game.ball.set_x_y(0, self.ping_pong_game.ping_pong_map.height / 2)
        self.assertEqual(self.ping_pong_game.ball.is_goal_in(
            self.ping_pong_game.ping_pong_map
        ), [False, True])
        self.ping_pong_game.ball.set_x_y(self.ping_pong_game.ping_pong_map.width, self.ping_pong_game.ping_pong_map.height / 2)
        self.assertEqual(self.ping_pong_game.ball.is_goal_in(
            self.ping_pong_game.ping_pong_map
        ), [True, False])

    def test_update_score(self):
        self.ping_pong_game.update_score([True, False])
        self.assertEqual(self.ping_pong_game.left_side_player.score, 1)
        self.assertEqual(self.ping_pong_game.right_side_player.score, 0)
        self.ping_pong_game.update_score([False, True])
        self.assertEqual(self.ping_pong_game.left_side_player.score, 1)
        self.assertEqual(self.ping_pong_game.right_side_player.score, 1)

    def test_ball_reset(self):
        self.ping_pong_game.ball.set_x_y(0, 0)
        self.ping_pong_game.ball.reset(
            self.ping_pong_game.ping_pong_map,
            self.ping_pong_game.default_data['ball']
        )
        self.assertNotEqual(self.ping_pong_game.ball.x, 0)
        self.assertNotEqual(self.ping_pong_game.ball.y, 0)

    def test_normalize_ball_direction(self):
        self.ping_pong_game.ball.set_direction((1, 1))
        self.ping_pong_game.ball.normalize_ball_direction()
        vector_length = np.sqrt(
            np.power(self.ping_pong_game.ball.direction[0], 2)
            + np.power(self.ping_pong_game.ball.direction[1], 2)
        )
        self.assertEqual(vector_length, 1)
