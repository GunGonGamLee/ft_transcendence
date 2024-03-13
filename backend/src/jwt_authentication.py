from channels.db import database_sync_to_async
import jwt
from django.conf import settings
from users.models import User
from channels.middleware import BaseMiddleware
from django.contrib.auth.models import AnonymousUser

SECRET_KEY = settings.JWT_AUTH_SECRET_KEY


class JWTAuthMiddleware(BaseMiddleware):
    def __init__(self, inner):
        super().__init__(inner)

    async def __call__(self, scope, receive, send):
        try:
            jwt_token = await self.get_jwt_token(scope)
            user = await self.get_user_by_jwt(jwt_token)
            scope['user'] = user
        except Exception as e:
            scope['user'] = AnonymousUser()
        return await super().__call__(scope, receive, send)

    async def get_jwt_token(self, scope):
        jwt_token = None
        headers = dict(scope['headers'])
        if b'cookie' in headers:
            cookies = headers[b'cookie'].decode()
            cookie_list = cookies.split('; ')
            for cookie in cookie_list:
                name, value = cookie.split('=')
                if name == 'jwt':
                    jwt_token = value
        return jwt_token

    @database_sync_to_async
    def get_user_by_jwt(self, jwt_token: str):
        decoded_token = jwt.decode(jwt_token, SECRET_KEY, algorithms=['HS256'])
        user_email = decoded_token.get('user_email')
        user = User.objects.get(email=user_email)
        return user
