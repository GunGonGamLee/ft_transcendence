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
    player_1_id = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name='player_1')
    player_2_id = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name='player_2')
    player_1_score = models.PositiveSmallIntegerField(default=0)
    player_2_score = models.PositiveSmallIntegerField(default=0)
    who_is_winner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name='winner')
    created_date = models.DateTimeField(auto_now_add=True)  # 생성 날짜
    updated_date = models.DateTimeField(auto_now=True)  # 수정 날짜


class Tournament(models.Model):
    player_1_id = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name='player_1')
    player_2_id = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name='player_2')
    player_3_id = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name='player_3')
    player_4_id = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name='player_4')
    created_date = models.DateTimeField(auto_now_add=True)  # 생성 날짜
    updated_date = models.DateTimeField(auto_now=True)  # 수정 날짜
