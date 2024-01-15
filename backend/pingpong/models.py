from django.db import models
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType


class TwoPlayerGame(models.Model):
    winner_id = models.ForeignKey('users.User', on_delete=models.PROTECT, related_name='winner')
    player1_id = models.ForeignKey('users.User', on_delete=models.PROTECT, related_name='player1')
    player2_id = models.ForeignKey('users.User', on_delete=models.PROTECT, related_name='player2')
    player1_score = models.IntegerField(default=0)
    player2_score = models.IntegerField(default=0)
    game_time = models.DurationField(null=False, blank=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class Tournament(models.Model):
    player1_id = models.ForeignKey('users.User', on_delete=models.PROTECT, related_name='tournament_player1')
    player2_id = models.ForeignKey('users.User', on_delete=models.PROTECT, related_name='tournament_player2')
    player3_id = models.ForeignKey('users.User', on_delete=models.PROTECT, related_name='tournament_player3')
    player4_id = models.ForeignKey('users.User', on_delete=models.PROTECT, related_name='tournament_player4')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('player1_id', 'player2_id', 'player3_id', 'player4_id')


class TournamentGame(models.Model):
    tournament_id = models.ForeignKey('Tournament', on_delete=models.PROTECT, related_name='tournament')
    player1_id = models.ForeignKey('Tournament', on_delete=models.PROTECT, related_name='tournament_player1')
    player2_id = models.ForeignKey('Tournament', on_delete=models.PROTECT, related_name='tournament_player2')
    winner_id = models.ForeignKey('Tournament', on_delete=models.PROTECT, related_name='tournament_winner')
    player1_score = models.IntegerField(default=0)
    player2_score = models.IntegerField(default=0)
    match_index = models.IntegerField(default=0)
    game_time = models.DurationField(null=False, blank=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class CustomGameRoom(models.Model):
    manager_id = models.ForeignKey('users.User', on_delete=models.PROTECT, related_name='manager')
    topic = models.CharField(max_length=100, null=False, blank=False)
    password = models.CharField(max_length=100, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class CustomGame(models.Model):
    room_id = models.ForeignKey('CustomGameRoom', on_delete=models.PROTECT, related_name='room')
    mode = models.PositiveSmallIntegerField(default=0)
    content_type = models.ForeignKey(ContentType, on_delete=models.PROTECT)
    object_id = models.PositiveIntegerField()
    content_object = GenericForeignKey('content_type', 'object_id')  # TwoPlayerGame, TournamentGame의 model
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
