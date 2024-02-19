import json
import random
from channels.generic.websocket import AsyncWebsocketConsumer
from games.models import Game, CasualGameView
from games.serializers import GameRoomSerializer
from django.db.models import Min, Count
from django.core.exceptions import ValidationError
from channels.db import database_sync_to_async
from asgiref.sync import sync_to_async
import logging
from django.contrib.auth.models import AnonymousUser
from users.models import User

logger = logging.getLogger(__name__)


class GameConsumer(AsyncWebsocketConsumer):
    def __init__(self, *args, **kwargs):
        super().__init__(args, kwargs)
        self.user = None
        self.game = None
        self.game_id = None
        self.game_group_name = "gg"
        self.serializer = None

    async def connect(self):
        logger.info("[게임방 입장] connect")
        await self.handle_connection()

    async def disconnect(self, close_code):
        logger.info("[게임방 입장] disconnect")
        if await self.is_invalid_user():
            return
        else:
            await self.channel_layer.group_discard(self.game_group_name, self.channel_name)

    async def handle_connection(self):
        if await self.is_invalid_user():
            await self.reject_invalid_user()
        else:
            await self.process_valid_user()

    async def is_invalid_user(self):
        user = self.scope['user']
        logger.info(f"[게임방 입장] user : {user}")
        return isinstance(user, AnonymousUser)

    async def reject_invalid_user(self):
        await self.accept()
        await self.send(text_data=json.dumps({"error": "Invalid user"}))
        await self.close()

    async def process_valid_user(self):
        try:
            await self.accept()
            game_id = self.scope["url_route"]["kwargs"]["game_id"]
            self.game_id = int(game_id)
            self.user = self.scope['user']
            if self.game_id == 0:
                logger.info(f"[게임방 입장] 빠른 입장")
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
                if await self.get_game_status() != 0 or await self.is_full():
                    raise ValidationError('invalid game id')
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

    @database_sync_to_async
    def count_casual_games(self):
        return CasualGameView.objects.aggregate(Count('game_id'))['game_id__count']

    @database_sync_to_async
    def create_room(self):
        self.game = Game.objects.create(title="보보봉", password=None, mode=random.choice([0, 1]), status=0, manager=self.user)
        logger.info(f"[게임방 입장] 게임방 생성 : {self.game.id}")

    @database_sync_to_async
    def save_game_object_by_id(self):
        self.game = Game.objects.get(id=self.game_id)

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
        logger.info(f"[게임방 입장] 게임방 입장 성공 : {self.game.id}")

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
        data = event["data"]

        await self.send(text_data=json.dumps({"data": data}))

class RankGameConsumer(AsyncWebsocketConsumer):
    game_queue = []
    async def connect(self):
        user = self.scope['user']
        if isinstance(user, AnonymousUser):
            await self.close(code=4001)
            return
        await self.accept()
        self.game_queue.append(user.id)
        logging.info(f'User {user.nickname} 연결되었어요')
        
        if len(self.game_queue) >= 1:
            try:
                await self.create_game()
                self.game_queue.clear()
                logging.info('게임이 생성되고 대기열이 모두 초기화되었어요.')
            except Exception as e:
                logging.error(e)

    async def disconnect(self, close_code):
        user = self.scope['user']
        if user.id in self.game_queue:
            self.game_queue.remove(user.id)
            logging.info(f'User {user.nickname} 이 연결을 끊었어요.')
            
    async def create_game(self):
        users = await sync_to_async(self.get_users)(self.game_queue[:4])
        game = await sync_to_async(self.create_game_instance)(users)
        for user_id in self.game_queue[:4]:
            channel = f'user_{user_id}'
            await self.channel_layer.group_add(channel, self.channel_name)
            await self.channel_layer.group_send(
                channel,
                {
                    'type': 'game_message',
                    'message': {"game_id": game.id}
                }
            )

    @staticmethod
    def get_users(user_ids):
        return [User.objects.get(id=user_id) for user_id in user_ids]
            
    @staticmethod
    def create_game_instance(users):
        try:
            game = Game.objects.create(
                mode = 2,
                status = 2,
                manager = users[0],
                # player1 = users[1],
                # player2 = users[2],
                # player3 = users[3],
            )
            return game
        except Exception as e:
            raise e
    
    async def game_message(self, event):
        await self.send(text_data=json.dumps({
            'message': event['message']
        }))