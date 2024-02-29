import json
import random
import logging
import urllib.parse
import asyncio
from django.contrib.auth.models import AnonymousUser
from django.db.models import Min, Count
from django.core.exceptions import ValidationError, PermissionDenied
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from asgiref.sync import sync_to_async
from games.models import Game, CasualGameView, PingPongGame, Ball, Bar, Player, PingPongMap, Result
from games.serializers import GameRoomSerializer, PvPMatchSerializer, TournamentMatchSerializer
from users.models import User
from datetime import datetime
from django.contrib.auth.hashers import check_password
from src.choices import GAME_SETTINGS_DICT

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
                await self.delete_user()

    @database_sync_to_async
    def get_game_status(self):
        game = Game.objects.get(game_id=self.game_id)
        return game.status

    @database_sync_to_async
    def delete_user(self):
        if self.game.mode == 0:  # PvP
            if self.user == self.game.manager:
                if self.game.player1:
                    self.game.manager, self.game.player1 = self.game.player1, None
                    self.game.status = 0
                else:
                    self.game.status = 4
                    self.game.save()
            elif self.user == self.game.player1:
                self.game.player1 = None
                self.game.status = 0
        else:  # Tournament
            if self.user == self.game.manager:
                for i in range(1, 4):
                    player = getattr(self.game, f"player{i}")
                    if player:
                        self.game.manager = player
                        setattr(self.game, f"player{i}", None)
                        break
                else:
                    self.game.status = 4
                    self.game.save()
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


class GameConsumer(AsyncWebsocketConsumer):
    users = []
    match1_users = []
    match2_users = []
    match3_users = []

    ping_pong_map = PingPongMap(0, 0)
    match1 = PingPongGame(ping_pong_map)
    match2 = PingPongGame(ping_pong_map)
    match3 = PingPongGame(ping_pong_map)

    def __init__(self, *args, **kwargs):
        super().__init__(args, kwargs)
        self.user = None
        self.game = None
        self.game_id = None
        self.room_group_name = None
        self.my_match = None
        self.match1_group_name = None
        self.match2_group_name = None
        self.match3_group_name = None

    async def connect(self):
        logger.info("[인게임] connect")
        if await self.is_invalid_user():
            await self.reject_invalid_user()
        else:
            await self.process_valid_user()

    async def disconnect(self, close_code):
        logger.info('[인게임] disconnect')
        if self.user in self.users:
            self.users.remove(self.user)
        if self.user in self.match1_users:
            self.match1_users.remove(self.user)
        elif self.user in self.match2_users:
            self.match2_users.remove(self.user)
        if self.user in self.match1_users:
            self.match3_users.remove(self.user)
        # todo 게임중이면 패배 처리
        # await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def is_invalid_user(self):
        self.user = self.scope['user']
        return isinstance(self.user, AnonymousUser)

    async def reject_invalid_user(self):
        await self.accept()
        await self.send(text_data=json.dumps({"error": "Invalid user"}))
        logger.info("[인게임] Invalid user")
        await self.close()

    async def process_valid_user(self):
        try:
            await self.accept()
            game_id = self.scope["url_route"]["kwargs"]["game_id"]
            self.game_id = int(game_id)
            await self.save_game_object_by_id()
            await self.validate_user(self.user.nickname)

            self.room_group_name = f"ingame_{self.game_id}"
            self.match1_group_name = f"match1_{self.game_id}"
            self.match2_group_name = f"match2_{self.game_id}"
            self.match3_group_name = f"match3_{self.game_id}"
            await self.channel_layer.group_add(self.room_group_name, self.channel_name)

            if self.game.status == 1:
                await self.set_game_status()
            if self.game.mode == 0:     # 1e1
                self.my_match = 1
                await self.save_match()
                await self.channel_layer.group_add(self.match1_group_name, self.channel_name)
            else:                       # tournament
                if (len(self.users) + 1) % 2 == 0:
                    self.my_match = 1
                    await self.save_match()
                    await self.channel_layer.group_add(self.match1_group_name, self.channel_name)
                else:
                    self.my_match = 2
                    await self.save_match()
                    await self.channel_layer.group_add(self.match2_group_name, self.channel_name)

            self.users.append(self.user)
            logger.info(f"users[] = {self.users}")
            if (self.game.mode == 0 and len(self.users) == 2) or (self.game.mode != 0 and len(self.users) == 4):
                serializer_data = await self.get_serializer_data()
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'game_info',
                        'data': serializer_data
                    }
                )
        except Exception as e:
            await self.send(text_data=json.dumps({"error": "[" + e.__class__.__name__ + "] " + str(e)}))
            await self.close()

    @database_sync_to_async
    def save_game_object_by_id(self):
        self.game = Game.objects.get(id=self.game_id)
        # todo 게임방이 꽉찬 방이 아닐 때.. 같은 이런 예외처리를 해야 하나

    @database_sync_to_async
    def validate_user(self, user):
        if self.game.manager.nickname == user:
            return
        elif self.game.player1.nickname == user:
            return
        elif self.game.mode == 1 and (self.game.player2.nickname == user or self.game.player3.nickname == user):
            return
        else:
            raise Exception("게임 방에 속한 유저가 아닙니다.")

    async def get_match(self):
        if self.game.mode == 0:  # 1e1
            self.my_match = 1
            await self.save_match()
            self.channel_layer.group_add(self.match1_group_name, self.channel_name)
        else:  # tournament
            if (len(self.users) + 1) % 2 == 0:
                self.my_match = 1
                await self.save_match()
                self.channel_layer.group_add(self.match1_group_name, self.channel_name)
            else:
                self.my_match = 2
                await self.save_match()
                self.channel_layer.group_add(self.match2_group_name, self.channel_name)

    @database_sync_to_async
    def save_match(self):
        if self.my_match == 1:
            if self.game.match1 is None:
                match = Result.objects.create(player1=self.user)
                self.game.match1 = match
                self.game.save()
            else:
                self.game.match1.player2 = self.user
                self.game.match1.save()
        else:
            if self.game.match2 is None:
                match = Result.objects.create(player1=self.user)
                self.game.match2 = match
                self.game.save()
            else:
                self.game.match2.player2 = self.user
                self.game.match2.save()

    @database_sync_to_async
    def set_game_status(self):
        self.game.status = 2
        self.game.save()

    @database_sync_to_async
    def get_serializer_data(self):
        serializer = None
        if self.game.mode == 0:
            serializer = PvPMatchSerializer(self.game)
        else:
            serializer = TournamentMatchSerializer(self.game)
        return serializer.data

    async def send_match_table(self):
        if (self.game.mode == 0 and len(self.users) == 2) or (self.game.mode != 0 and len(self.users) == 4):
            serializer_data = await self.get_serializer_data()
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'game_info',
                    'data': serializer_data
                }
        if self.game.mode == 0:
            logger.info("[인게임] PVP")
        elif self.game.mode == 1:
            logger.info("[인게임] TOURNAMENT")
        elif self.game.mode == 2:
            logger.info("[인게임] RANK")

    async def receive(self, text_data):
        # todo try catch
        data = json.loads(text_data)
        message_type = data.get('type')
        message_data = data.get('data', {})
        await self.save_game_object_by_id()
        if message_type == 'start':
            if self.ping_pong_map.width == 0:
                await self.set_values(message_data)
            if self.my_match == 1:
                self.match1_users.append(self.user)
            elif self.my_match == 2:
                self.match2_users.append(self.user)

            # 게임 시작
            if self.game.mode == 0 and len(self.match1_users) == 2:
                await self.send_pvp_start_message(self.match1)
                await asyncio.sleep(2)
                self.match1.started_at = datetime.now()
                while not self.match1.finished:
                    await self.play(self.match1)
                    await self.send_pvp_in_game_message()
                    await asyncio.sleep(1 / 24)

            elif self.game.mode != 0 and len(self.match1_users) == 2 and len(self.match2_users) == 2:
                await self.send_tournament_start_message()
                await asyncio.sleep(2)
                self.match1.started_at = datetime.now()
                self.match2.started_at = datetime.now()
                while not self.match1.finished and not self.match2.finished:
                    await self.play(self.match1)
                    await self.play(self.match2)
                    await self.send_tournament_in_game_message(self.match1, self.match2)
                    await asyncio.sleep(1 / 24)

        elif message_type == 'keyboard':
            if message_data == 'up':
                # todo ?
                pass
            elif message_data == 'down':
                # todo ?
                pass

    async def play(self, match):
        # todo 볼 속도 1/24 계산
        if self.match1.ball.is_ball_hit_wall(self.match1.ping_pong_map):
            self.match1.ball.bounce((1, -1))
        elif self.match1.ball.is_ball_inside_bar(self.match1.left_side_player.bar) or self.match1.ball.is_ball_inside_bar(self.match1.right_side_player.bar):
            self.match1.ball.bounce((-1, 1))
        if (whether_score_a_goal := self.match1.ball.is_goal_in(self.match1.ping_pong_map)) != [False, False]:
            self.match1.update_score(whether_score_a_goal)
            self.match1.ball.reset(self.match1.ping_pong_map)
        if self.match1.left_side_player.score + self.match1.right_side_player.score == 5:
            self.match1.finished = True
        match.ball.move()

    async def set_values(self, message_data):
        map_width = message_data['map_width']
        map_height = message_data['map_height']

        self.ping_pong_map.width = map_width
        self.ping_pong_map.height = map_height

        await self.set_match(self.match1, 1)
        if self.game.mode != 0:
            await self.set_match(self.match2, 2)
            await self.set_match(self.match3, 3)

    @database_sync_to_async
    def set_match(self, match, match_num):
        if match_num == 1:
            match.left_side_player.user = self.game.match1.player1
            match.right_side_player.user = self.game.match1.player2
        elif match_num == 2:
            match.left_side_player.user = self.game.match2.player1
            match.right_side_player.user = self.game.match2.player2

        match.ball.x = match.ping_pong_map.width / 2
        match.ball.y = match.ping_pong_map.height / 2

        match.left_side_player.bar.x = GAME_SETTINGS_DICT['bar']['width']
        match.left_side_player.bar.y = self.ping_pong_map.height / 2 - GAME_SETTINGS_DICT['bar']['height'] / 2

        match.right_side_player.bar.x = self.ping_pong_map.width - GAME_SETTINGS_DICT['bar']['width']
        match.right_side_player.bar.y = self.ping_pong_map.height / 2 - GAME_SETTINGS_DICT['bar']['height'] / 2

    async def send_pvp_start_message(self, match):
        data = {
            'map': {
                'width': match.ping_pong_map.width,
                'height': match.ping_pong_map.height
            },
            'bar': {
                'width': match.left_side_player.bar.width,
                'height': match.left_side_player.bar.height
            },
            'ball': {
                'x': match.ball.x,
                'y': match.ball.y
            },
            'left_side_player': {
                'x': match.left_side_player.bar.x,
                'y': match.left_side_player.bar.y,
                'score': match.left_side_player.score
            },
            'right_side_player': {
                'x': match.right_side_player.bar.x,
                'y': match.right_side_player.bar.y,
                'score': match.left_side_player.score
            }
        }
        await self.channel_layer.group_send(
            self.match1_group_name,
            {
                'type': 'game_start',
                'data': data
            }
        )
        await self.game_start({
            'type': 'game_start',
            'data': data
        })

    async def send_pvp_in_game_message(self):
        data = {
            'ball': {
                'x': self.match1.ball.x,
                'y': self.match1.ball.y,
                'direction': self.match1.ball.direction
            },
            'left_side_player': {
                'x': self.match1.left_side_player.bar.x,
                'y': self.match1.left_side_player.bar.y,
                'score': self.match1.left_side_player.score
            },
            'right_side_player': {
                'x': self.match1.right_side_player.bar.x,
                'y': self.match1.right_side_player.bar.y,
                'score': self.match1.left_side_player.score
            }
        }
        await self.channel_layer.group_send(
            self.match1_group_name,
            {
                'type': 'in_game',
                'data': data
            }
        )
        await self.in_game({
            'type': 'in_game',
            'data': data
        })

    async def send_tournament_start_message(self):
        data = {
            'map': {
                'width': self.match1.ping_pong_map.width,
                'height': self.match1.ping_pong_map.height
            },
            'bar': {
                'width': self.match1.left_side_player.bar.width,
                'height': self.match1.left_side_player.bar.height
            },
            'ball': {
                'x': self.match1.ball.x,
                'y': self.match1.ball.y
            },
            'left_side_player': {
                'x': self.match1.left_side_player.bar.x,
                'y': self.match1.left_side_player.bar.y,
                'score': self.match1.left_side_player.score
            },
            'right_side_player': {
                'x': self.match1.right_side_player.bar.x,
                'y': self.match1.right_side_player.bar.y,
                'score': self.match1.left_side_player.score
            }
        }
        await self.channel_layer.group_send(
            self.match1_group_name,
            {
                'type': 'game_start',
                'data': data
            }
        )
        await self.channel_layer.group_send(
            self.match2_group_name,
            {
                'type': 'game_start',
                'data': data
            }
        )
        await self.game_start({
            'type': 'game_start',
            'data': data
        })

    async def send_tournament_in_game_message(self, match1, match2):
        match1_data = self.create_match_data(match1)
        match2_data = self.create_match_data(match2)

        if not match1.finished:
            if self.my_match == 1:
                await self.in_game({
                    'type': 'in_game',
                    'data': match1_data
                })
            await self.channel_layer.group_send(
                self.match1_group_name,
                {
                    'type': 'in_game',
                    'data': match1_data
                }
            )
        if not match2.finished:
            if self.my_match == 2:
                await self.in_game({
                    'type': 'in_game',
                    'data': match2_data
                })
            await self.channel_layer.group_send(
                self.match2_group_name,
                {
                    'type': 'in_game',
                    'data': match2_data
                }
            )

    def create_match_data(self, match):
        ball_data = {
            'x': match.ball.x,
            'y': match.ball.y
        }
        player1_data = {
            'x': match.left_side_player.bar.x,
            'y': match.left_side_player.bar.y,
            'score': match.left_side_player.score
        }
        player2_data = {
            'x': match.right_side_player.bar.x,
            'y': match.right_side_player.bar.y,
            'score': match.right_side_player.score
        }
        return {
            'ball': ball_data,
            'player1': player1_data,
            'player2': player2_data
        }

    async def game_info(self, event):
        await self.send(text_data=json.dumps(event))

    async def game_start(self, event):
        await self.send(text_data=json.dumps(event))

    async def in_game(self, event):
        await self.send(text_data=json.dumps(event))
