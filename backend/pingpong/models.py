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
