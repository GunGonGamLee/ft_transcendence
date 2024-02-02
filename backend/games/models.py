from django.db import models, connection
# from django_db_views.db_view import DBView
from users.models import User


class Game(models.Model):
    MODE_CHOICES = [
        (0, "1vs1"),
        (1, "casual_tournament"),
        (2, "rank"),
    ]
    STATUS_CHOICES = [
        (0, "WAITING"),
        (1, "IN_GAME"),
        (2, "FINISHED"),
        (3, "DELETED"),
    ]

    mode = models.PositiveSmallIntegerField(choices=MODE_CHOICES)
    title = models.CharField(null=True, blank=True)
    password = models.CharField(null=True, blank=True)
    status = models.PositiveSmallIntegerField(choices=STATUS_CHOICES)
    manager = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    players = models.ForeignKey('Player', on_delete=models.SET_NULL, null=True)
    match1 = models.ForeignKey('Result', related_name='result_match1', on_delete=models.SET_NULL, null=True, blank=True)
    match2 = models.ForeignKey('Result', related_name='result_match2', on_delete=models.SET_NULL, null=True, blank=True)
    match3 = models.ForeignKey('Result', related_name='result_match3', on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'games'


class Player(models.Model):
    player1 = models.ForeignKey(User, related_name='player1_id', on_delete=models.SET_NULL, null=True, blank=True)
    player2 = models.ForeignKey(User, related_name='player2_id', on_delete=models.SET_NULL, null=True, blank=True)
    player3 = models.ForeignKey(User, related_name='player3_id', on_delete=models.SET_NULL, null=True, blank=True)
    player4 = models.ForeignKey(User, related_name='player4_id', on_delete=models.SET_NULL, null=True, blank=True)

    class Meta:
        db_table = 'players'


class Result(models.Model):
    winner = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    player1 = models.ForeignKey(Player, related_name='result_player1', on_delete=models.SET_NULL, null=True, blank=True)
    player2 = models.ForeignKey(Player, related_name='result_player2', on_delete=models.SET_NULL, null=True, blank=True)
    player1_score = models.PositiveSmallIntegerField(null=True, blank=True)
    player2_score = models.PositiveSmallIntegerField(null=True, blank=True)
    started_at = models.DateTimeField(null=True, blank=True)
    playtime = models.TimeField(null=True, blank=True)

    class Meta:
        db_table = 'results'


class RankGameViewManager(models.Manager):
    def get_queryset(self):
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT games.id, games.mode, games.status
                FROM games                
                WHERE games.status = 0 and games.mode = 2;
            """)
            results = cursor.fetchall()

        return [self.model(*row) for row in results]


class RankGameView(models.Model):
    game = models.ForeignKey(Game, on_delete=models.SET_NULL, null=True, blank=True)
    mode = models.PositiveSmallIntegerField()
    status = models.PositiveSmallIntegerField()

    objects = RankGameViewManager()

    class Meta:
        managed = False


class CasualGameViewManager(models.Manager):
    def get_queryset(self):
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT games.id, games.mode, games.status
                FROM games                
                WHERE games.status = 0 and (games.mode = 0 or games.mode = 1);
            """)
            results = cursor.fetchall()

        return [self.model(*row) for row in results]


class CasualGameView(models.Model):
    game = models.ForeignKey(Game, on_delete=models.SET_NULL, null=True, blank=True)
    mode = models.PositiveSmallIntegerField()
    status = models.PositiveSmallIntegerField()

    objects = CasualGameViewManager()

    class Meta:
        managed = False


class GameRecordViewManager(models.Manager):
    def get_queryset(self):
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT mode, g.id, p.player1_id, p.player2_id, p.player3_id, p.player4_id
                from game g
                inner join player p on g.players_id = p.id;
            """)
            results = cursor.fetchall()

        return [self.model(*row) for row in results]


class GameRecordView(models.Model):
    game = models.ForeignKey(Game, on_delete=models.SET_NULL, null=True, blank=True)
    mode = models.PositiveSmallIntegerField()
    player1 = models.ForeignKey(Player, related_name='gamerecordview_player1', on_delete=models.SET_NULL, null=True, blank=True)
    player2 = models.ForeignKey(Player, related_name='gamerecordview_player2', on_delete=models.SET_NULL, null=True, blank=True)
    player3 = models.ForeignKey(Player, related_name='gamerecordview_player3', on_delete=models.SET_NULL, null=True, blank=True)
    player4 = models.ForeignKey(Player, related_name='gamerecordview_player4', on_delete=models.SET_NULL, null=True, blank=True)

    objects = GameRecordViewManager()

    class Meta:
        managed = False
