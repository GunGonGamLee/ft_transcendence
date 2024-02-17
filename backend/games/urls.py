from django.urls import path
from .views import *

urlpatterns = [
	path('', GameView.as_view(), name='game'),
	path('<str:game_id>/', GameRoomView.as_view(), name='gameRoom'),
	path('results', GameResultListView.as_view(), name='gameResultList')
]