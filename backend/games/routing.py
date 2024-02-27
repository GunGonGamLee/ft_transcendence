from django.urls import re_path, path

from . import consumers

websocket_urlpatterns = [
    re_path(r"ws/games/start/(?P<game_id>\w+)", consumers.GameConsumer.as_asgi()),
    re_path(r"ws/games/(?P<game_id>\w+)/", consumers.GameRoomConsumer.as_asgi()),
    path('ws/rankgames/', consumers.RankGameRoomConsumer.as_asgi()),
]
