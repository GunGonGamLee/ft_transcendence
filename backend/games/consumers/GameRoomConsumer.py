import json
import random
import logging
import urllib.parse
from django.contrib.auth.models import AnonymousUser
from django.db.models import Min, Count
from django.core.exceptions import ValidationError, PermissionDenied
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from asgiref.sync import sync_to_async
from games.models import Game, CasualGameView, PingPongGame, Ball, Bar, Player, PingPongMap, Result
from games.serializers import GameRoomSerializer, PvPMatchSerializer, TournamentMatchSerializer
from django.contrib.auth.hashers import check_password

logger = logging.getLogger(__name__)


class GameRoomConsumer(AsyncWebsocketConsumer):
    def __init__(self, *args, **kwargs):
        super().__init__(args, kwargs)
        self.user = None
        self.game = None
        self.game_id = None
        self.game_group_name = "gg"
        self.serializer = None

    async def connect(self):
        if await self.is_invalid_user():
            await self.reject_invalid_user()
        else:
            await self.process_valid_user()

    async def disconnect(self, close_code):
        if await self.is_invalid_user():
            logger.info("[게임방 퇴장] Invalid user")
            return
        else:
            if await self.get_game_status() <= 1:
                await self.save_game_object_by_id()
                await self.delete_user()
                await self.channel_layer.group_discard(
                    self.game_group_name,
                    self.channel_name
                )
                serializer_data = await self.get_serializer_data()
                await self.channel_layer.group_send(
                    self.game_group_name,
                    {
                        'type': 'game_info',
                        'data': serializer_data
                    }
                )

    @database_sync_to_async
    def get_game_status(self):
        game = Game.objects.get(game_id=self.game_id)
        return game.status

    @database_sync_to_async
    def delete_user(self):
        if self.game.mode == 0:  # PvP
            if self.user == self.game.manager:
                if self.game.player1 is not None:
                    self.game.manager = self.game.player1
                    self.game.player1 = None
                    self.game.status = 0
                else:
                    self.game.status = 4
            elif self.user == self.game.player1:
                self.game.player1 = None
                self.game.status = 0
        else:  # Tournament
            if self.user == self.game.manager:
                if self.is_user_in_room() is False:
                    self.game.status = 4
            else:
                for i in range(1, 4):
                    player = getattr(self.game, f"player{i}")
                    if self.user == player:
                        setattr(self.game, f"player{i}", None)
                        if i == 3:
                            self.game.status = 0
                        break
        logger.info(f"[게임방 퇴장] {self.user.nickname} - {self.game_id}번 방 퇴장")
        self.game.save()
        self.save_game_object_by_id()

    def is_user_in_room(self):
        for i in range(1, 4):
            player = getattr(self.game, f"player{i}")
            if player:
                self.game.manager = player
                self.game.save()
                setattr(self.game, f"player{i}", None)
                return True
        return False

    async def is_invalid_user(self):
        self.user = self.scope['user']
        return isinstance(self.user, AnonymousUser)

    async def reject_invalid_user(self):
        await self.accept()
        await self.send(text_data=json.dumps({"error": "Invalid user"}))
        logger.info("[게임방 입장] Invalid user")
        await self.close()

    async def process_valid_user(self):
        try:
            await self.accept()
            game_id = self.scope["url_route"]["kwargs"]["game_id"]
            self.game_id = int(game_id)
            if self.game_id == 0:
                logger.info(f"[게임방 입장] {self.user.nickname} - 빠른 입장")
                count = await self.count_casual_games()
                if count == 0:
                    await self.create_room()
                    self.game_id = self.game.id
                else:
                    await self.get_casual_games()
                    await self.save_game_object_by_id()
                    await self.game_join()
            else:
                await self.save_game_object_by_id()
                await self.can_join_game()
                if await self.get_game_status() != 0 or await self.is_full():
                    raise ValidationError('invalid game id')
                if await self.is_manager() is False:
                    await self.game_join()
            self.game_group_name = f'game_{game_id}'
            serializer_data = await self.get_serializer_data()
            await self.channel_layer.group_add(self.game_group_name, self.channel_name)
            await self.channel_layer.group_send(
                self.game_group_name,
                {
                    'type': 'game_info',
                    'data': serializer_data
                }
            )

        except Exception as e:
            await self.send(text_data=json.dumps({"error": "[" + e.__class__.__name__ + "] " + str(e)}))
            await self.close()

    async def receive(self, text_data):
        data = json.loads(text_data)
        message_type = data.get('type')
        message_data = data.get('data', {})
        if message_type == 'game_start' and message_data == 'true':
            await self.channel_layer.group_send(
                self.game_group_name,
                {
                    'type': 'url',
                    'data': f"/games/start/{self.game_id}/"
                }
            )

    async def url(self, event):
        await self.send(text_data=json.dumps(event))

    @database_sync_to_async
    def count_casual_games(self):
        return CasualGameView.objects.aggregate(Count('game_id'))['game_id__count']

    @database_sync_to_async
    def create_room(self):
        mode = random.choice([0, 1])
        match1 = Result.objects.create()
        if mode == 0:
            self.game = Game.objects.create(title="보보봉", password=None, mode=mode, status=0, manager=self.user, match1=match1)
        else:
            match2 = Result.objects.create()
            match3 = Result.objects.create()
            self.game = Game.objects.create(title="보보봉", password=None, mode=mode, status=0, manager=self.user, match1=match1, match2=match2, match3=match3)
        logger.info(f"[게임방 입장] 게임방 생성 : {self.game.id}")

    @database_sync_to_async
    def save_game_object_by_id(self):
        self.game = Game.objects.get(id=self.game_id)

    @database_sync_to_async
    def can_join_game(self):
        query_string = self.scope['query_string'].decode()
        query_params = urllib.parse.parse_qs(query_string)
        user_input_password = query_params.get('password', [None])[0]
        hashed_password = self.game.password
        if hashed_password is None:
            return
        if check_password(user_input_password, hashed_password) is False:
            raise PermissionDenied("can't access")

    @database_sync_to_async
    def get_casual_games(self):
        self.game_id = CasualGameView.objects.aggregate(Min('game_id'))['game_id__min']

    @database_sync_to_async
    def get_game_status(self):
        return self.game.status

    @database_sync_to_async
    def get_serializer_data(self):
        serializer = GameRoomSerializer(self.game)
        return serializer.data

    @database_sync_to_async
    def is_manager(self):
        if self.game.manager.nickname == self.user.nickname:
            return True
        return False

    async def game_join(self):
        player1 = await sync_to_async(self.game.__getattribute__)('player1_id')
        player2 = await sync_to_async(self.game.__getattribute__)('player2_id')
        player3 = await sync_to_async(self.game.__getattribute__)('player3_id')

        if self.game.mode == 0:
            if player1 is None:
                self.game.player1 = self.user
                self.game.status = 1
                await database_sync_to_async(self.game.save)()
            else:
                raise ValidationError('Invalid game id')
        else:
            if player1 is None:
                self.game.player1 = self.user
                await database_sync_to_async(self.game.save)()
            elif player2 is None:
                self.game.player2 = self.user
                await database_sync_to_async(self.game.save)()
            elif player3 is None:
                self.game.player3 = self.user
                self.game.status = 1
                await database_sync_to_async(self.game.save)()
            else:
                raise ValidationError('Invalid game id')
        logger.info(f"[게임방 입장] {self.user.nickname} - {self.game_id}번 방 입장")

    async def is_full(self):
        player1 = await sync_to_async(self.game.__getattribute__)('player1_id')
        player2 = await sync_to_async(self.game.__getattribute__)('player2_id')
        player3 = await sync_to_async(self.game.__getattribute__)('player3_id')

        if self.game.mode == 0 and player1 is not None:
            return True
        if player1 is not None and player2 is not None and player3 is not None:
            return True
        return False

    async def game_info(self, event):
        await self.send(text_data=json.dumps(event))
