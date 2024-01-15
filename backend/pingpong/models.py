from django.db import models


class TwoPlayerGame(models.Model):
    winner_id = models.ForeignKey('users.User', on_delete=models.PROTECT, related_name='winner')
    player1_id = models.ForeignKey('users.User', on_delete=models.PROTECT, related_name='player1')
    player2_id = models.ForeignKey('users.User', on_delete=models.PROTECT, related_name='player2')
    player1_score = models.IntegerField(default=0)
    player2_score = models.IntegerField(default=0)
    game_time = models.DurationField(null=False, blank=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

