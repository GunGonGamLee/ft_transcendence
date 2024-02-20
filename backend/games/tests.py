from django.test import TestCase

from games.models import PingPongGame

from users.models import User


# Create your tests here.

class PingPongGameTestCase(TestCase):
    user = None

    @classmethod
    def setUpClass(cls):
        cls.user = User.objects.create_user(
            nickname='테스터',
            email='test@test.com',
        )
        cls.ping_pong_game = PingPongGame(
            '테스터',
            (1920, 1080),
            (10, 1920/2, 1080/2),
            (10, 20, 0, 1080/2 - 10)
        )

    def setUp(self):
        pass

    @classmethod
    def tearDownClass(cls):
        cls.user.delete()

    def test_ping_pong_game(self):
        pass
