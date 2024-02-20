from django.test import TestCase

from games.models import PingPongGame

from users.models import User


# Create your tests here.

class PingPongGameTestCase(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            nickname='테스터',
            email='test@test.com',
        )
        self.ping_pong_game = PingPongGame(
            '테스터',
            (1920, 1080),
            (10, 1920 / 2, 1080 / 2),
            (10, 20, 0, 1080 / 2 - 10)
        )

    def tearDown(self):
        self.user.delete()

    def test_set_ball(self):
        self.ping_pong_game.ball.set_direction(45)
        self.ping_pong_game.ball.set_speed(10)
        self.ping_pong_game.ball.set_x_y(10, 10)
        self.assertEqual(self.ping_pong_game.ball.direction, 45)
        self.assertEqual(self.ping_pong_game.ball.speed, 10)
        self.assertEqual(self.ping_pong_game.ball.x, 10)
        self.assertEqual(self.ping_pong_game.ball.y, 10)

    def test_set_racket(self):
        self.ping_pong_game.racket.set_x_y(10, 10)
        self.assertEqual(self.ping_pong_game.racket.x, 10)
        self.assertEqual(self.ping_pong_game.racket.y, 10)
