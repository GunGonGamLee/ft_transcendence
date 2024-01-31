from django.urls import path, include

urlpatterns = [
    path('login/', include('login.urls')),
    path('users/', include('users.urls')),
	path('friends/', include('friends.urls')),
]
