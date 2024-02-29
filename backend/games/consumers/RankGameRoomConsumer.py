import json
import logging
from django.contrib.auth.models import AnonymousUser
from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import sync_to_async
from games.models import Game, CasualGameView, PingPongGame, Ball, Bar, Player, PingPongMap, Result
from users.models import User

logger = logging.getLogger(__name__)


class RankGameRoomConsumer(AsyncWebsocketConsumer):

    game_queue = []

    async def connect(self):
        user = self.scope['user']
        self.room_group_name = 'game_queue'
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name,
        )
        await self.accept()
        if isinstance(user, AnonymousUser):
            await self.close(code=4001)
            return
        self.game_queue.append(user.id)
        logging.info(f'[RANK] User {user.nickname} 연결되었어요')

        if len(self.game_queue) >= 4:
            try:
                await self.create_game()
                self.game_queue.clear()
            except Exception as e:
                logging.error(e)

    async def disconnect(self, close_code):
        user = self.scope['user']
        if user.id in self.game_queue:
            self.game_queue.remove(user.id)

    async def create_game(self):
        logging.info(f"[RANK] Creating game with users: {self.game_queue[:4]}")
        users = await sync_to_async(self.get_users)(self.game_queue[:4])
        game = await sync_to_async(self.create_game_instance)(users)
        game_url = f"/games/{game.id}/"

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'url',
                'url': game_url,
            }
        )

    @staticmethod
    def get_users(user_ids):
        return [User.objects.get(id=user_id) for user_id in user_ids]

    @staticmethod
    def create_game_instance(users):
        try:
            match1 = Result.objects.create()
            match2 = Result.objects.create()
            match3 = Result.objects.create()
            game = Game.objects.create(
                mode=2,
                status=2,
                manager=users[0],
                player1=users[1],
                player2=users[2],
                player3=users[3],
                match1=match1,
                match2=match2,
                match3=match3
            )
            return game
        except Exception as e:
            raise e

    async def url(self, event):
        await self.send(text_data=json.dumps(event))
