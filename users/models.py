from django.contrib.auth.models import AbstractUser
from django.db import models
from django.conf import settings


class User(AbstractUser):
    """
        AbstractUser가 제공하는 필드들을 포함한다.
        ID, PASSWORD, last_login, is_superuser, username, first_name,
        last_name, email, is_staff, is_active, date_joined
    """
    nickname = models.CharField(max_length=8, unique=True)
    rating = models.PositiveIntegerField(default=0)
    profile_image = models.ImageField(upload_to='profile_image/', null=True, blank=True)
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
