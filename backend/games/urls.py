from django.urls import path
from .views import *

urlpatterns = [
	path('', GameView.as_view(), name='game'),
	path('local/', LocalGameView.as_view(), name='localGame'),
	path('<str:game_id>/', GameRoomView.as_view(), name='gameRoom'),
	path('results', GameResultListView.as_view(), name='gameResultList'),
	path('results/<str:game_id>', GameResultView.as_view(), name='gameResult'),
]
