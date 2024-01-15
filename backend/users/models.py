from django.contrib.auth.models import AbstractUser
from django.db import models
from django.conf import settings


class User(AbstractUser):
    """
        AbstractUser가 제공하는 필드들을 포함한다.
        ID, PASSWORD, last_login, is_superuser, username, first_name,
        last_name, email, is_staff, is_active, date_joined
    """
    nickname = models.CharField(max_length=8, unique=True)  # 닉네임
    email = models.EmailField(unique=True)  # 이메일
    rating = models.PositiveIntegerField(default=0)  # 레이팅
    avatar = models.ImageField(upload_to='avatar/', null=True, blank=True)  # 아바타 이미지
    is_active = models.BooleanField(default=True)  # 활성화 여부
    joined_date = models.DateTimeField(auto_now_add=True)  # 가입 날짜
    created_date = models.DateTimeField(auto_now_add=True)  # 생성 날짜
    updated_date = models.DateTimeField(auto_now=True)  # 수정 날짜


class FriendList(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT,
                             related_name='friend_list_as_user')
    friend = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT,
                               related_name='friend_list_as_friend')

    class Meta:
        unique_together = ('user', 'friend')

    created_date = models.DateTimeField(auto_now_add=True)  # 생성 날짜
    updated_date = models.DateTimeField(auto_now=True)  # 수정 날짜
