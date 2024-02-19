import os

from django.core.files.uploadedfile import SimpleUploadedFile
from django.urls import reverse
from django.test import TestCase, RequestFactory
from rest_framework.test import APIClient
import jwt
from django.conf import settings
from users.models import User


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
        cls.user = User.objects.create_user(nickname='test', email='skdpwls153@naver.com')
        cls.user.save()
        cls.image_path = os.path.join(os.path.dirname(__file__), 'test.jpeg')
        cls.image = SimpleUploadedFile('test.jpeg', open(cls.image_path, 'rb').read(), content_type='image/jpeg')

    def setUp(self):
        """
        테스트 메소드 실행 전에 실행됩니다. 테스트 메소드 실행 전에 매번 실행됩니다.
        :return: None
        :rtype: None
        """
        self.token = jwt.encode({'email': self.user.email}, settings.SECRET_KEY, algorithm='HS256')
        self.factory = RequestFactory()

    @classmethod
    def tearDownClass(cls):
        """
        테스트 메소드 실행 후에 실행됩니다. 테스트 메소드 실행 후에 매번 실행됩니다.
        :return: None
        :rtype: None
        """
        cls.user.delete()

    def test_avatar_upload(self):
        request = self.factory.post(
            reverse('userAvatar', kwargs={'nickname': self.user.nickname}),
            data={'avatar': self.image},
            format='multipart',
            headers={'Authorization': f'Bearer {self.token}'}
        )
        self.assertIsNotNone(request.FILES['avatar'])

    def test_avatar_upload_duplicate(self):
        pass

    def test_avatar_upload_fail(self):
        pass

    def test_avatar_upload_invalid(self):
        pass

    def test_avatar_upload_unauthorized(self):
        pass

    def test_avatar_upload_server_error(self):
        pass

    def test_avatar_update(self):
        pass
