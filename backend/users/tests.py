import os

import django
from django.test import TestCase, Client


# Create your tests here.

class AvatarUpdateTest(TestCase):
    image_path, image = None, None

    def setUp(self):
        """
        테스트 메소드 실행 전에 실행됩니다. 테스트 메소드 실행 전에 매번 실행됩니다.
        :return: None
        :rtype: None
        """
        self.client = Client()

    @classmethod
    def setUpTestData(cls):
        """
        테스트를 위한 데이터를 미리 세팅합니다. 테스트 메소드 실행 전에 한 번만 실행됩니다.
        :param cls: 클래스 자신
        :return: None
        :rtype: None
        """
        cls.image_path = os.path.join(os.path.dirname(__file__), 'test.jpeg')
        cls.image = open(cls.image_path, 'rb').read()

    def test_avatar_upload(self):
        response = self.client.post(
            path='/api/users/yena/avatar/',
            content_type='multipart/form-data',
            charset_normalizer='utf-8',
            data={
                'avatar': self.image,
            })
        self.assertEqual(response.status_code, 201)

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
