from django.urls import re_path, path

from .consumers import GameConsumer, GameRoomConsumer, RankGameRoomConsumer

websocket_urlpatterns = [
    re_path(r"ws/games/start/(?P<game_id>\w+)", GameConsumer.GameConsumer.as_asgi()),
    re_path(r"ws/games/(?P<game_id>\w+)/", GameRoomConsumer.GameRoomConsumer.as_asgi()),
    path('ws/rankgames/', RankGameRoomConsumer.RankGameRoomConsumer.as_asgi()),
]
