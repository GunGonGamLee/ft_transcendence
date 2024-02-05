from django.urls import path
from .views import *

urlpatterns = [
	path('', GameView.as_view(), name='game'),
	path('<str:room_id>/', GameRoomView.as_view(), name='gameRoom'),
]