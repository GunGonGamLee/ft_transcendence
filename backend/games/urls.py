from django.urls import path
from .views import *

urlpatterns = [
	path('', GameView.as_view(), name='game'),
]