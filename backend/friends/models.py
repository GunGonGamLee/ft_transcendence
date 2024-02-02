from django.db import models
from users.models import User


class Friend(models.Model):
    PENDING = 0
    ACCEPTED = 1
    REJECTED = 2
    FRIENDS_CHOICES = [
        (PENDING, "대기"),
        (ACCEPTED, "수락"),
        (REJECTED, "거절"),
    ]
    user_id = models.ForeignKey(User, on_delete=models.PROTECT,
                                related_name='user_who_is_requesting',
                                db_column='user_id')  # 친구 요청한 사람
    friend_id = models.ForeignKey(User, on_delete=models.PROTECT,
                                  related_name='friend_who_is_requested',
                                  db_column='friend_id')  # 친구 요청 받은 사람
    status = models.PositiveSmallIntegerField(default=PENDING, choices=FRIENDS_CHOICES)  # 친구 상태. 0: 수락 대기, 1: 친구 수락, 2: 친구 거절

    class Meta:
        db_table = 'friends'
        unique_together = ('user_id', 'friend_id')

    created_at = models.DateTimeField(auto_now_add=True)  # 생성 날짜
    updated_at = models.DateTimeField(auto_now=True)  # 수정 날짜
