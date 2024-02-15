import os
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "src.settings")

from django.core.asgi import get_asgi_application
django_asgi_app = get_asgi_application()

import games.routing
import friends.routing
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.security.websocket import AllowedHostsOriginValidator
from src.jwt_authentication import JWTAuthMiddleware

application = ProtocolTypeRouter(
    {
        "http": django_asgi_app,
        "websocket": AllowedHostsOriginValidator(
            JWTAuthMiddleware(
                URLRouter(
                    games.routing.websocket_urlpatterns + friends.routing.websocket_urlpatterns
                )
            )
        )
    }
)

# application = ProtocolTypeRouter(
# 	{
# 		"http": django_asgi_app,
# 		"websocket": AllowedHostsOriginValidator(
# 			URLRouter(
# 				games.routing.websocket_urlpatterns + friends.routing.websocket_urlpatterns
#             )
#         )
#     }
# )