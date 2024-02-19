from django.urls import path
from .views import SetNicknameView, UserMeInfoView, UserInfoView, UserAvatarView

urlpatterns = [
    path('nickname/', SetNicknameView.as_view(), name='nickname'),
    path('me/', UserMeInfoView.as_view(), name='userMeInfo'),
    path('<str:nickname>/', UserInfoView.as_view(), name='userInfo'),
    path('<str:nickname>/avatar/', UserAvatarView.as_view(), name='userAvatar'),
]
