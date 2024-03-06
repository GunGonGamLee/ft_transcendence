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
from users.models import User
from src.choices import GAME_SETTINGS_DICT

logger = logging.getLogger(__name__)


class GameConsumer(AsyncWebsocketConsumer):
    class UserList:
        pass

    def __init__(self, *args, **kwargs):
        super().__init__(args, kwargs)
        self.user = None
        self.manager = False
        self.my_match = 0
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
        logger.info(f'[인게임] disconnect - {self.user.nickname}')
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
            setattr(self.UserList, self.match1_group_name, [])
            setattr(self.UserList, self.match2_group_name, [])
            setattr(self.UserList, self.match3_group_name, [])
        getattr(self.UserList, game_group_name).append(self.user)

    async def when_manager(self):
        start_time = time.time()
        while True:
            if time.time() - start_time >= 30:
                raise TimeoutError()
            num = self.channel_layer.groups[f"{self.game_group_name}"].__len__()
            if (self.game.mode == 0 and num == 2) or (self.game.mode != 0 and num == 4):
                break
            await asyncio.sleep(0.3)
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
        elif (self.game.mode == 1 or self.game.mode == 2) and (self.game.player2.nickname == user or self.game.player3.nickname == user):
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
            await self.channel_layer.group_add(self.match1_group_name, self.channel_name)
        else:  # tournament
            join_num = self.channel_layer.groups[self.game_group_name].__len__()
            if join_num % 2 == 1:
                self.my_match = 1
                if join_num == 1:
                    await self.save_match(1)
                else:
                    await self.save_match(2)
                await self.channel_layer.group_add(self.match1_group_name, self.channel_name)
            else:
                self.my_match = 2
                if join_num == 2:
                    await self.save_match(1)
                else:
                    await self.save_match(2)
                await self.channel_layer.group_add(self.match2_group_name, self.channel_name)

    @database_sync_to_async
    def save_match(self, player):
        if self.my_match == 1:
            if player == 1:
                self.game.match1.player1 = self.user
                self.player1 = True
            else:
                self.game.match1.player2 = self.user
            self.game.match1.save()
        else:
            if player == 1:
                self.game.match2.player1 = self.user
                self.player1 = True
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
            logger.info("[시작] PVP")
        elif self.game.mode == 1:
            logger.info("[시작] TOURNAMENT")
        elif self.game.mode == 2:
            logger.info("[시작] RANK")

    async def receive(self, text_data):
        # todo try catch
        data = json.loads(text_data)
        message_type = data.get('type')
        message_data = data.get('data', {})
        await self.save_game_object_by_id()
        if message_type == 'start':

            # append .. 할 필요가 없을 거 같은디
            if self.my_match == 1:
                getattr(self.UserList, self.match1_group_name).append(self.user)
            elif self.my_match == 2:
                getattr(self.UserList, self.match2_group_name).append(self.user)

            if self.player1:
                if self.my_match == 1:
                    await self.init_game(message_data, self.my_match)
                    start_time = time.time()
                    while True:
                        if time.time() - start_time >= 30:
                            raise TimeoutError()
                        num = self.channel_layer.groups[self.match1_group_name].__len__()
                        if num == 2:
                            break
                        await asyncio.sleep(0.3)
                    await self.send_start_message(self.match1, self.match1_group_name)
                    await asyncio.sleep(2)
                    self.match1.started_at = datetime.now()
                    while not self.match1.finished:
                        await self.play(self.match1)
                        await self.send_in_game_message(self.match1, self.match1_group_name)
                        await asyncio.sleep(1 / 24)
                    await self.save_match_data_in_database(self.match1)
                    if self.game.mode == 0:
                        await self.send_end_message(self.game.match1, True)
                        return
                    else:
                        await self.save_match3_matching_in_database(self.game.match1.winner)
                        await self.send_end_message(self.game.match1, False)
                        return
                elif self.my_match == 2:
                    await self.init_game(message_data, self.my_match)
                    start_time = time.time()
                    while True:
                        if time.time() - start_time >= 30:
                            raise TimeoutError()
                        num = self.channel_layer.groups[self.match2_group_name].__len__()
                        if num == 2:
                            break
                        await asyncio.sleep(0.3)

                    await self.send_start_message(self.match2, self.match2_group_name)
                    await asyncio.sleep(2)
                    self.match2.started_at = datetime.now()
                    while not self.match2.finished:
                        await self.play(self.match2)
                        await self.send_in_game_message(self.match2, self.match2_group_name)
                        await asyncio.sleep(1 / 24)
                    await self.save_match_data_in_database(self.match2)
                    await self.save_match3_matching_in_database(self.game.match2.winner)
                    await self.send_end_message(self.game.match2, False)
                    return
        elif message_type == 'match3_start':
            if self.my_match == 3:
                getattr(self.UserList, self.match3_group_name).append(self.user)
            if self.player1:
                await self.init_game(message_data, self.my_match)
                start_time = time.time()
                while True:
                    if time.time() - start_time >= 30:
                        raise TimeoutError()
                    num = self.channel_layer.groups[self.match1_group_name].__len__()
                    if num == 2:
                        break
                    await asyncio.sleep(0.3)
                await self.send_start_message(self.match3, self.match3_group_name)
                await asyncio.sleep(2)
                self.match3.started_at = datetime.now()
                while not self.match3.finished:
                    await self.play(self.match3)
                    await self.send_in_game_message(self.match3, self.match3_group_name)
                    await asyncio.sleep(1 / 24)
                await self.send_end_message(self.game.match3, True)

        elif message_type == 'keyboard':
            if self.player1 is False:
                if message_data == 'up':
                    if self.my_match == 1:
                        await self.send_data(self.match1_group_name, 'up')
                    elif self.my_match == 2:
                        await self.send_data(self.match2_group_name, 'up')
                    elif self.my_match == 3:
                        await self.send_data(self.match3_group_name, 'up')

                elif message_data == 'down':
                    if self.my_match == 1:
                        await self.send_data(self.match1_group_name, 'down')
                    elif self.my_match == 2:
                        await self.send_data(self.match2_group_name, 'down')
                    elif self.my_match == 3:
                        await self.send_data(self.match3_group_name, 'down')
            else:
                if message_data == 'up':
                    if self.my_match == 1:
                        self.match1.left_side_player.bar.y += 1
                    elif self.my_match == 2:
                        self.match2.left_side_player.bar.y += 1
                    elif self.my_match == 3:
                        self.match3.left_side_player.bar.y += 1
                elif message_data == 'down':
                    if self.my_match == 1:
                        self.match1.left_side_player.bar.y -= 1
                    elif self.my_match == 2:
                        self.match2.left_side_player.bar.y -= 1
                    elif self.my_match == 3:
                        self.match3.left_side_player.bar.y -= 1

    async def send_data(self, group_name, type):
        await self.channel_layer.group_send(
            group_name,
            {
                'type': type,
            }
        )

    async def play(self, match):
        if match.ball.is_ball_hit_wall(match.ping_pong_map):
            logger.info(f"[인게임] match{self.my_match} - 공 벽에 부딪힘")
            match.ball.bounce((1, -1))
        elif match.ball.is_ball_inside_bar(match.left_side_player.bar) or match.ball.is_ball_inside_bar(
                match.right_side_player.bar):
            logger.info(f"[인게임] match{self.my_match} - 바에 부딪힘")
            match.ball.bounce((-1, 1))
        if (whether_score_a_goal := match.ball.is_goal_in(match.ping_pong_map)) != [False, False]:
            logger.info(f"[인게임] match{self.my_match} - {whether_score_a_goal} 득점")
            match.update_score(whether_score_a_goal)
            match.ball.reset(match.ping_pong_map)
        if match.left_side_player.score + match.right_side_player.score == 5:
            match.finished = True
        match.ball.move()

    @database_sync_to_async
    def init_game(self, message_data, match):
        map_width = message_data['map_width']
        map_height = message_data['map_height']

        self.ping_pong_map = PingPongMap(map_width, map_height)

        if match == 1:
            self.match1 = PingPongGame(self.ping_pong_map, self.game.match1.player1, self.game.match1.player2)
        elif match == 2:
            self.match2 = PingPongGame(self.ping_pong_map, self.game.match2.player1, self.game.match2.player2)
        elif match == 3:
            self.match3 = PingPongGame(self.ping_pong_map, self.game.match3.player1, self.game.match3.player2)

    @database_sync_to_async
    def save_match_data_in_database(self, result: PingPongGame):
        finished_at = datetime.now()
        time_diff = finished_at - result.started_at
        playtime = datetime.min + time_diff
        match = None
        if self.my_match == 1:
            match = self.game.match1
        elif self.my_match == 2:
            match = self.game.match2
        elif self.my_match == 3:
            match = self.game.match3
        match.player1_score = result.left_side_player.score
        match.player2_score = result.right_side_player.score
        match.started_at = result.started_at
        match.playtime = playtime
        if result.left_side_player.score > result.right_side_player.score:
            match.winner = match.player1
        else:
            match.winner = match.player2
        match.save()

    @database_sync_to_async
    def save_match3_matching_in_database(self, winner: User):
        match = self.game.match3
        if self.my_match == 1:
            match.player1 = winner
            self.player1 = True
        else:
            match.player2 = winner
            self.player1 = False
        self.my_match = 3
        match.save()

    async def send_end_message(self, match: Result, final: bool):
        type_ = 'game_end'
        data = {
            'game_id': self.game_id,
            'winner': match.winner.nickname,
            'final': final
        }
        await self.channel_layer.group_send(
            self.game_group_name,
            {
                'type': type_,
                'data': data
            }
        )
        await self.game_end({
            'type': type_,
            'data': data
        })

    async def send_start_message(self, match, group_name):
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
            group_name,
            {
                'type': 'game_start',
                'data': data
            }
        )
        await self.game_start({
            'type': 'game_start',
            'data': data
        })

    async def send_in_game_message(self, match, group_name):
        data = {
            'ball': {
                'x': match.ball.x,
                'y': match.ball.y,
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
            group_name,
            {
                'type': 'in_game',
                'data': data
            }
        )
        await self.in_game({
            'type': 'in_game',
            'data': data
        })

    async def game_info(self, event):
        await self.send(text_data=json.dumps(event))

    async def game_start(self, event):
        await self.send(text_data=json.dumps(event))

    async def in_game(self, event):
        await self.send(text_data=json.dumps(event))

    async def game_end(self, event):
        await self.send(text_data=json.dumps(event))

    async def up(self, event):
        logger.info(f"match{self.my_match} , player2 - up")
        if self.my_match == 1:
            self.match1.right_side_player.bar.y += 1
        elif self.my_match == 2:
            self.match2.right_side_player.bar.y += 1
        elif self.my_match == 3:
            self.match3.right_side_player.bar.y += 1

    async def down(self, event):
        logger.info(f"match{self.my_match} , player2 - down")
        if self.my_match == 1:
            self.match1.right_side_player.bar.y -= 1
        elif self.my_match == 2:
            self.match2.right_side_player.bar.y -= 1
        elif self.my_match == 3:
            self.match3.right_side_player.bar.y -= 1
