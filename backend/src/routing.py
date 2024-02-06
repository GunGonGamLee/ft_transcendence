from channels.routing import ProtocolTypeRouter, URLRouter
from django.urls import path
from friends.consumers import ChatConsumer

application = ProtocolTypeRouter({
    "websocket": URLRouter([
        path("ws/friend_status/", ChatConsumer),
    ]),
})