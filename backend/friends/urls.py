from django.urls import path
from .views import *

urlpatterns = [
	path('', FriendsView.as_view(), name='friends'),
	path('accept/', AcceptFriendView.as_view(), name='accept_friend'),
	path('reject/', RejectFriendView.as_view(), name='reject_friend'),
	path('pending/', FriendPendingView.as_view(), name='pending_friend'),
	path('search/', FriendSearchView.as_view(), name='search_friend'),
]