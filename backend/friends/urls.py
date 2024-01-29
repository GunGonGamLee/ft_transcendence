from django.urls import path, include
from .views import *

urlpatterns = [
	path('', FriendsView.as_view(), name='friends'),
	path('/accept/', AcceptFriendView.as_view(), name='accept_friend'),
	path('/reject/', RejectFriendView.as_view(), name='reject_friend'),
]