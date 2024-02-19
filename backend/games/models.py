from django.db import models
from users.models import User
from src.choices import MODE_CHOICES, STATUS_CHOICES


class Game(models.Model):

    mode = models.PositiveSmallIntegerField(choices=MODE_CHOICES)
    title = models.CharField(null=True, blank=True)
    password = models.CharField(null=True, blank=True)
    status = models.PositiveSmallIntegerField(choices=STATUS_CHOICES)
    manager = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    player1 = models.ForeignKey(User, related_name='player1_id', on_delete=models.SET_NULL, null=True, blank=True)
    player2 = models.ForeignKey(User, related_name='player2_id', on_delete=models.SET_NULL, null=True, blank=True)
    player3 = models.ForeignKey(User, related_name='player3_id', on_delete=models.SET_NULL, null=True, blank=True)
    match1 = models.ForeignKey('Result', related_name='result_match1', on_delete=models.SET_NULL, null=True, blank=True)
    match2 = models.ForeignKey('Result', related_name='result_match2', on_delete=models.SET_NULL, null=True, blank=True)
    match3 = models.ForeignKey('Result', related_name='result_match3', on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    started_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'games'


class Result(models.Model):
    winner = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    player1 = models.ForeignKey(User, related_name='result_player1', on_delete=models.SET_NULL, null=True, blank=True)
    player2 = models.ForeignKey(User, related_name='result_player2', on_delete=models.SET_NULL, null=True, blank=True)
    player1_score = models.PositiveSmallIntegerField(null=True, blank=True)
    player2_score = models.PositiveSmallIntegerField(null=True, blank=True)
    started_at = models.DateTimeField(null=True, blank=True)
    playtime = models.TimeField(null=True, blank=True)

    class Meta:
        db_table = 'results'


class RankGameView(models.Model):
    game_id = models.IntegerField(primary_key=True)

    class Meta:
        managed = False
        db_table = 'rank_game_view'


class CasualGameView(models.Model):
    game_id = models.IntegerField(primary_key=True)
    mode = models.PositiveSmallIntegerField()

    class Meta:
        managed = False
        db_table = 'casual_game_view'


class GameRecordView(models.Model):
    game_id = models.IntegerField()
    mode = models.IntegerField()
    user_id = models.IntegerField()
    started_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        managed = False
        db_table = 'game_record_view'


class CasualGameListView(models.Model):
    game_id = models.IntegerField(primary_key=True)
    mode = models.PositiveSmallIntegerField()
    status = models.PositiveSmallIntegerField()

    class Meta:
        managed = False
        db_table = 'casual_game_list_view'
