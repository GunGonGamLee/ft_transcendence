from django.db import models
from django.conf import settings


class CustomRoom(models.Model):
    manager_id = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name='manager')
    room_description = models.CharField(max_length=42)
    room_topic = models.CharField(max_length=10)
    created_date = models.DateTimeField(auto_now_add=True)  # 생성 날짜
    updated_date = models.DateTimeField(auto_now=True)  # 수정 날짜


class CustomGame(models.Model):
    room_id = models.ForeignKey(CustomRoom, on_delete=models.PROTECT, related_name='room')
    created_date = models.DateTimeField(auto_now_add=True)  # 생성 날짜
    updated_date = models.DateTimeField(auto_now=True)  # 수정 날짜
