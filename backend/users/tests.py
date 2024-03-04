import os

import jwt
from django.conf import settings
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase, RequestFactory
from django.urls import reverse
from users.models import User
from users.views import UserAvatarView

from src.choices import AVATAR_CHOICES_DICT


class AvatarUpdateTest(TestCase):
    user, image_path, image = None, None, None

    @classmethod
    def setUpTestData(cls):
        """
        테스트를 위한 데이터를 미리 세팅합니다. 테스트 메소드 실행 전에 한 번만 실행됩니다.
        :param cls: 클래스 자신
        :return: None
        :rtype: None
        """
        cls.user = User.objects.create_user(nickname='tester', email='test@test.com')
        cls.image_path = os.path.join(os.path.dirname(__file__), 'test.jpeg')
        cls.image = SimpleUploadedFile('test.jpeg', open(cls.image_path, 'rb').read(), content_type='image/jpeg')

    def setUp(self):
        """
        테스트 메소드 실행 전에 실행됩니다. 테스트 메소드 실행 전에 매번 실행됩니다.
        :return: None
        :rtype: None
        """
        self.token = jwt.encode({'user_email': self.user.email}, settings.SECRET_KEY, algorithm='HS256')
        self.factory = RequestFactory()

    @classmethod
    def tearDownClass(cls):
        """
        테스트 메소드 실행 후에 실행됩니다. 테스트 메소드 실행 후에 매번 실행됩니다.
        :return: None
        :rtype: None
        """

    def test_avatar_upload(self):
        request = self.factory.post(
            reverse('userAvatar', kwargs={'nickname': self.user.nickname}),
            data={'avatar': self.image},
            format='multipart',
            headers={'Authorization': f'Bearer {self.token}'}
        )
        self.assertEqual(self.image.open('rb').read(), request.FILES['avatar'].file.read())

    def test_avatar_upload_duplicate(self):
        pass

    def test_avatar_upload_invalid(self):
        pass

    def test_avatar_upload_unauthorized(self):
        request = self.factory.post(
            reverse('userAvatar', kwargs={'nickname': '예나'}),
            data={'avatar': self.image},
            format='multipart',
            headers={'Authorization': f'Bearer {self.token}'}
        )
        view = UserAvatarView()
        view.setup(request)
        response = view.post(request, '예나')
        self.assertEqual(401, response.status_code)

    def test_avatar_upload_server_error(self):
        pass

    def test_avatar_update(self):
        pass

    def test_avatar_update_bad_request(self):
        response = self.client.patch(
            f"{reverse('userAvatar', kwargs={'nickname': self.user.nickname})}",
            format='application/json',
            headers={'Authorization': f'Bearer {self.token}'},
        )
        self.assertEqual(400, response.status_code)

    def test_avatar_update_unauthorized(self):
        nickname = '예나'
        response = self.client.patch(
            f"{reverse('userAvatar', kwargs={'nickname': nickname})}?avatar={AVATAR_CHOICES_DICT[0]}",
            format='application/json',
            headers={'Authorization': f'Bearer {self.token}'},
        )
        self.assertEqual(401, response.status_code)
