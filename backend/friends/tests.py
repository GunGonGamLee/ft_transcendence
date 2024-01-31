from rest_framework.test import APITestCase
from rest_framework.test import APIClient
from django.urls import reverse
from users.models import User, Friend
from jwt import encode
from django.conf import settings
import json
from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
import jwt

class FriendsViewTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create(email='bod0925@naver.com')
        self.token = jwt.encode({'email': self.user.email}, settings.SECRET_KEY, algorithm='HS256')

    def tearDown(self):
        self.user.delete()

    def test_get_friends(self):
        response = self.client.get(
            reverse('friends'),
            HTTP_AUTHORIZATION=f'Bearer {self.token}'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_post_friends(self):
        response = self.client.post(
            reverse('friends'),
            {'nickname': 'friend'},
            HTTP_AUTHORIZATION=f'Bearer {self.token}'
        )
        self.assertEqual(response.status_code, status .HTTP_200_OK)

class AcceptFriendViewTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create(email='bod0925@naver.com.com')
        self.friend = User.objects.create(email='sejokim@student.42seoul.kr')
        self.friend_request = Friend.objects.create(user_id=self.user, friend_id=self.friend, status=Friend.PENDING)
        self.token = jwt.encode({'email': self.user.email}, settings.SECRET_KEY, algorithm='HS256')

    def tearDown(self):
        self.friend_request.delete()
        self.friend.delete()
        self.user.delete()

    def test_post_accept_friend(self):
        response = self.client.post(
            reverse('accept_friend'),
            {'nickname': 'sejokim'},
            HTTP_AUTHORIZATION=f'Bearer {self.token}'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

class RejectFriendViewTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create(email='bod0925@naver.com')
        self.friend = User.objects.create(email='sejokim@student.42seoul.kr')
        self.friend_request = Friend.objects.create(user_id=self.user, friend_id=self.friend, status=Friend.PENDING)
        self.token = jwt.encode({'email': self.user.email}, settings.SECRET_KEY, algorithm='HS256')

    def tearDown(self):
        self.friend_request.delete()
        self.friend.delete()
        self.user.delete()

    def test_post_reject_friend(self):
        response = self.client.post(
            reverse('reject_friend'),
            {'nickname': '세조킴'},
            HTTP_AUTHORIZATION=f'Bearer {self.token}'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)