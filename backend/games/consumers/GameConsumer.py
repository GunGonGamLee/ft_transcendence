import json
import logging
import asyncio
import time
from django.contrib.auth.models import AnonymousUser
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from games.models import Game, CasualGameView, PingPongGame, Ball, Bar, Player, PingPongMap, Result
from games.serializers import GameRoomSerializer, PvPMatchSerializer, TournamentMatchSerializer
from datetime import datetime
from src.choices import GAME_SETTINGS_DICT

logger = logging.getLogger(__name__)


class GameConsumer(AsyncWebsocketConsumer):
    class UserList:
        pass

    def __init__(self, *args, **kwargs):
        super().__init__(args, kwargs)
        self.user = None
        self.manager = False
        self.my_match = None
        self.player1 = False

        self.game = None
        self.game_id = None

        self.game_group_name = None
        self.match1_group_name = None
        self.match2_group_name = None
        self.match3_group_name = None

        self.ping_pong_map = None
        self.match1 = None
        self.match2 = None
        self.match3 = None

    async def connect(self):
        logger.info("[인게임] connect")
        if await self.is_invalid_user():
            await self.reject_invalid_user()
        else:
            await self.process_valid_user()

    async def disconnect(self, close_code):
        logger.info('[인게임] disconnect')
        # if self.user in self.users:
        #     self.users.remove(self.user)
        # if self.user in self.match1_users:
        #     self.match1_users.remove(self.user)
        # elif self.user in self.match2_users:
        #     self.match2_users.remove(self.user)
        # if self.user in self.match1_users:
        #     self.match3_users.remove(self.user)
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
            if self.game.status == 1:
                await self.set_game_status()
            await self.validate_user(self.user.nickname)
            logger.info(f"[인게임] {self.user.nickname} - {self.game_id}번 방 연결 - {self.manager}")

            game_group_name = f"ingame_{self.game_id}"
            self.game_group_name = game_group_name
            self.match1_group_name = f"match1_{self.game_id}"
            self.match2_group_name = f"match2_{self.game_id}"
            self.match3_group_name = f"match3_{self.game_id}"
            await self.channel_layer.group_add(self.game_group_name, self.channel_name)

            await self.get_match()
            await self.append_user(game_group_name)
            await self.log(game_group_name)

            if self.manager:
                await self.when_manager()

        except Exception as e:
            await self.send(text_data=json.dumps({"error": "[" + e.__class__.__name__ + "] " + str(e)}))
            await self.close()

    async def log(self, game_group_name):
        logger.info(f"users[] = {getattr(self.UserList, game_group_name)}, "
                    f"me = {self.user.nickname} - manager: {self.manager}")

    async def append_user(self, game_group_name):
        if hasattr(self.UserList, game_group_name) is False:
            setattr(self.UserList, game_group_name, [])
        getattr(self.UserList, game_group_name).append(self.user)

    async def when_manager(self):
        start_time = time.time()
        while True:
            if time.time() - start_time >= 30:
                raise TimeoutError()
            num = self.channel_layer.groups[f"{self.game_group_name}"].__len__()
            if (self.game.mode == 0 and num == 2) or (self.game.mode != 0 and num == 4):
                break
        await self.send_match_table()

    @database_sync_to_async
    def save_game_object_by_id(self):
        self.game = Game.objects.get(id=self.game_id)
        # todo 게임방이 꽉찬 방이 아닐 때.. 같은 이런 예외처리를 해야 하나

    @database_sync_to_async
    def validate_user(self, user):
        if self.game.manager.nickname == user:
            self.manager = True
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
            if self.channel_layer.groups[self.game_group_name].__len__() == 1:
                await self.save_match(1)
            else:
                await self.save_match(2)
            self.channel_layer.group_add(self.match1_group_name, self.channel_name)
        else:  # tournament
            join_num = self.channel_layer.groups[self.game_group_name].__len__()
            if join_num % 2 == 1:
                self.my_match = 1
                if join_num == 1:
                    await self.save_match(1)
                else:
                    await self.save_match(2)
                self.channel_layer.group_add(self.match1_group_name, self.channel_name)
            else:
                self.my_match = 2
                if join_num == 2:
                    await self.save_match(1)
                else:
                    await self.save_match(2)
                self.channel_layer.group_add(self.match2_group_name, self.channel_name)

    @database_sync_to_async
    def save_match(self, player):
        if self.my_match == 1:
            if player == 1:
                self.game.match1.player1 = self.user
            else:
                self.game.match1.player2 = self.user
            self.game.match1.save()
        else:
            if player == 1:
                self.game.match2.player1 = self.user
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
        game = Game.objects.get(id=self.game_id)
        self.game = game
        if self.game.mode == 0:
            serializer = PvPMatchSerializer(game)
        else:
            serializer = TournamentMatchSerializer(game)
        return serializer.data

    async def send_match_table(self):
        serializer_data = await self.get_serializer_data()
        await self.channel_layer.group_send(
            self.game_group_name,
            {
                'type': 'game_info',
                'data': serializer_data
            }
        )
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
        elif self.match1.ball.is_ball_inside_bar(self.match1.left_side_player.bar) or self.match1.ball.is_ball_inside_bar(
                self.match1.right_side_player.bar):
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


"""
방장이 디비 처리를 다 할 거야

방장 가 들어옴
나 들어옴
다 들어옴
라 들어옴

겜방 group_add
겜방 그룹 len == 1이면 match1 - player1 
    디비에 본인 정보 저장
겜방 그룹 len == 3이면 match1 - player2 
    디비에 본인 정보 저장
겜방 그룹 len == 2이면 match2 - player1 
    디비에 본인 정보 저장
겜방 그룹 len == 4이면 match2 - player2     
    디비에 본인 정보 저장
방장이 아니면
    매칭된 곳 group_add

방장이면
    현재 시간 저장
    while true 하고
        겜방 그룹 인원이 모드에 해당하는 수 만큼 차면 break
        특정 시간 지나면 raise

    로그 - "[인게임] RANK, PVP, TOURNAMENT 게임 시작"
    group_send()




"""
