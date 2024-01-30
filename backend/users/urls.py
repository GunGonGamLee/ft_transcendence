from django.urls import path
from .views import SetNicknameView, UserInfoView

urlpatterns = [
    path('nickname/', SetNicknameView.as_view(), name='nickname'),
    path('me/', UserInfoView.as_view(), name='userInfo'),
]
