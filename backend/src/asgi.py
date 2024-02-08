import os

from channels.routing import ProtocolTypeRouter, URLRouter
from channels.security.websocket import AllowedHostsOriginValidator
from django.core.asgi import get_asgi_application

from src.jwt_authentication import JWTAuthMiddleware
import games.routing
import friends.routing

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "src.settings")

django_asgi_app = get_asgi_application()

application = ProtocolTypeRouter(
    {
        "http": django_asgi_app,
        # "websocket": AllowedHostsOriginValidator(
        #     JWTAuthMiddleware(
        #         URLRouter(
        #             games.routing.websocket_urlpatterns
        #         )
        #     )
        # )
    }
)
