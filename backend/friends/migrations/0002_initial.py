# Generated by Django 4.2.8 on 2024-02-01 12:41

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('friends', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.AddField(
            model_name='friend',
            name='friend_id',
            field=models.ForeignKey(db_column='friend_id', on_delete=django.db.models.deletion.PROTECT, related_name='friend_who_is_requested', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='friend',
            name='user_id',
            field=models.ForeignKey(db_column='user_id', on_delete=django.db.models.deletion.PROTECT, related_name='user_who_is_requesting', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AlterUniqueTogether(
            name='friend',
            unique_together={('user_id', 'friend_id')},
        ),
    ]
