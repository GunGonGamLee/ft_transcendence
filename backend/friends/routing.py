from django.urls import path
from . import consumers

websocket_urlpatterns = [
	path('ws/friend_status/', consumers.FriendStatusConsumer.as_asgi()),
]