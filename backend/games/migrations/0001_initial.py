# Generated by Django 4.2.8 on 2024-02-14 05:54

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='CasualGameView',
            fields=[
                ('game_id', models.IntegerField(primary_key=True, serialize=False)),
                ('mode', models.PositiveSmallIntegerField()),
            ],
            options={
                'db_table': 'casual_game_view',
                'managed': False,
            },
        ),
        migrations.CreateModel(
            name='GameRecordView',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('game_id', models.IntegerField()),
                ('mode', models.IntegerField()),
                ('user_id', models.IntegerField()),
            ],
            options={
                'db_table': 'game_record_view',
                'managed': False,
            },
        ),
        migrations.CreateModel(
            name='RankGameView',
            fields=[
                ('game_id', models.IntegerField(primary_key=True, serialize=False)),
            ],
            options={
                'db_table': 'rank_game_view',
                'managed': False,
            },
        ),
        migrations.CreateModel(
            name='Result',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('player1_score', models.PositiveSmallIntegerField(blank=True, null=True)),
                ('player2_score', models.PositiveSmallIntegerField(blank=True, null=True)),
                ('started_at', models.DateTimeField(blank=True, null=True)),
                ('playtime', models.TimeField(blank=True, null=True)),
                ('player1', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='result_player1', to=settings.AUTH_USER_MODEL)),
                ('player2', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='result_player2', to=settings.AUTH_USER_MODEL)),
                ('winner', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'db_table': 'results',
            },
        ),
        migrations.CreateModel(
            name='Game',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('mode', models.PositiveSmallIntegerField(choices=[(0, '1vs1'), (1, 'casual_tournament'), (2, 'rank')])),
                ('title', models.CharField(blank=True, null=True)),
                ('password', models.CharField(blank=True, null=True)),
                ('status', models.PositiveSmallIntegerField(choices=[(0, 'AVAILABLE_WAITING'), (1, 'FULL_WAITING'), (2, 'IN_GAME'), (3, 'FINISHED'), (4, 'DELETED')])),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('manager', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to=settings.AUTH_USER_MODEL)),
                ('match1', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='result_match1', to='games.result')),
                ('match2', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='result_match2', to='games.result')),
                ('match3', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='result_match3', to='games.result')),
                ('player1', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='player1_id', to=settings.AUTH_USER_MODEL)),
                ('player2', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='player2_id', to=settings.AUTH_USER_MODEL)),
                ('player3', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='player3_id', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'db_table': 'games',
            },
        ),
    ]
