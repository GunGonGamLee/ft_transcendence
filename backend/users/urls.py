from django.urls import path
from .views import SetNicknameView

urlpatterns = [
    path('nickname/', SetNicknameView.as_view(), name='nickname'),
]
