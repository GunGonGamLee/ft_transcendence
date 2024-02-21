import random

from django.test import TestCase

from games.models import PingPongGame

from users.models import User


# Create your tests here.

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
        self.ping_pong_game = PingPongGame(
            '테스터',
            (1920, 1080),
            (10, 1920 / 2, 1080 / 2),
            (10, 20, 0, 1080 / 2 - 10, 10)
        )

    def tearDown(self):
        self.left_side_player.delete()
        self.right_side_player.delete()

    def test_set_ball(self):
        self.ping_pong_game.ball.set_direction((-1, 0))
        self.ping_pong_game.ball.set_speed(10)
        self.ping_pong_game.ball.set_x_y(10, 10)
        self.assertEqual(self.ping_pong_game.ball.direction, (-1, 0))
        self.assertEqual(self.ping_pong_game.ball.speed, 10)
        self.assertEqual(self.ping_pong_game.ball.x, 10)
        self.assertEqual(self.ping_pong_game.ball.y, 10)

    def test_set_ball_direction_fail(self):
        direction = (random.uniform(1.1, 2), random.uniform(-1, 1))
        with self.assertRaises(ValueError):
            self.ping_pong_game.ball.set_direction(direction)

    def test_set_racket_position(self):
        self.ping_pong_game.racket.set_x_y(10, 10)
        self.assertEqual(self.ping_pong_game.racket.x, 10)
        self.assertEqual(self.ping_pong_game.racket.y, 10)

    def test_move_ball(self):
        self.ping_pong_game.ball.set_direction((-1, 0))
