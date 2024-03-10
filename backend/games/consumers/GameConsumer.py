import asyncio
import autobahn
import json
import logging
import threading
import time
from datetime import datetime
from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer
from django.contrib.auth.models import AnonymousUser
from games.models import Game, PingPongGame, PingPongMap, Result
from games.serializers import PvPMatchSerializer, TournamentMatchSerializer, TournamentFinalMatchSerializer
from src.choices import MODE_CHOICES_DICT, GAME_SETTINGS_DICT
from users.models import User

logger = logging.getLogger(__name__)
p1_lock = threading.Lock()
p2_lock = threading.Lock()


class GameConsumer(AsyncWebsocketConsumer):
    def __init__(self, *args, **kwargs):
        super().__init__(args, kwargs)
        self.user = None
        self.manager = False
        self.my_match = 0
        self.is_final = False
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
        if await self._is_invalid_user():
            await self._reject_invalid_user()
        else:
            logger.info(f"[인게임] connect - {self.user.nickname}")
            await self._process_valid_user_connect()

    async def receive(self, text_data):
        data = json.loads(text_data)
        message_type = data.get('type')
        message_data = data.get('data', {})
        await self._save_game_object_by_id()
        if message_type == 'start':
            asyncio.create_task(self._process_game_start(message_data))
        elif message_type == 'match3_start':
            asyncio.create_task(self._process_match3_game_start(message_data))
        elif message_type == 'match3_info':
            await self._send_final_match_table()
        elif message_type == 'keyboard':
            asyncio.create_task(self._process_keyboard_input(message_data))

    async def disconnect(self, close_code):
        if await self._is_invalid_user():
            await self._reject_invalid_user()
        else:
            logger.info(f"[인게임] disconnect - {self.user.nickname}")
            await self._process_valid_user_disconnect()

    async def _is_invalid_user(self):
        self.user = self.scope['user']
        return isinstance(self.user, AnonymousUser)

    async def _reject_invalid_user(self):
        logger.info("[인게임] Invalid user")
        await self.accept()
        await self.send(text_data=json.dumps({"error": "Invalid user"}))
        await self.close()

    async def _process_valid_user_connect(self):
        try:
            await self.accept()
            game_id = self.scope["url_route"]["kwargs"]["game_id"]
            self.game_id = int(game_id)
            await self._save_game_object_by_id()
            await self._validate_user(self.user.nickname)
            logger.info(f"[인게임] {self.user.nickname} - {self.game_id}번 방 연결 - {self.manager}")

            game_group_name = f"ingame_{self.game_id}"
            self.game_group_name = game_group_name
            self.match1_group_name = f"match1_{self.game_id}"
            self.match2_group_name = f"match2_{self.game_id}"
            self.match3_group_name = game_group_name
            await self.channel_layer.group_add(self.game_group_name, self.channel_name)

            await self._get_match()

            if self.manager:
                await self._waiting_join(self.game_group_name, "game")
                await self._send_match_table()
                await self._print_start_log(self.game.mode)

        except Exception as e:
            await self.send(text_data=json.dumps({"error": "[" + e.__class__.__name__ + "] " + str(e)}))
            await self.close()

    async def _process_valid_user_disconnect(self):
        await self._save_game_object_by_id()
        if await self._is_finished(self.game.mode) is False:  # 겜 중인데 나감
            if self.game.mode == 0:
                await self._dodge(self.my_match, self.match1, self.player1, self.match1_group_name)
            else:
                match = self.game.match3
                if self.player1:  # p1
                    pass
                else:  # p2
                    pass

    async def _dodge(self, my_match, result: PingPongGame, player1: bool, match_group_name):
        if player1:
            self._save_match_data(my_match, result, False)
            await self.channel_layer.group_discard(match_group_name, self.channel_name)
        else:
            await self.channel_layer.group_send(
                match_group_name,
                {
                    'type': 'player2_disconnect'
                })
            await self.channel_layer.group_discard(match_group_name, self.channel_name)

    @database_sync_to_async
    def _save_match_data(self, my_match, result: PingPongGame, finished: bool):
        finished_at = datetime.now()
        time_diff = finished_at - result.started_at
        playtime = datetime.min + time_diff

        match = None
        if my_match == 1:
            match = self.game.match1
        elif my_match == 2:
            match = self.game.match2
        elif my_match == 3:
            match = self.game.match3

        if match.playtime is not None:
            return

        match.player1_score = result.left_side_player.score
        match.player2_score = result.right_side_player.score
        match.started_at = result.started_at
        match.playtime = playtime
        if not finished and match.winner is None:
            match.winner = match.player2
        elif finished and match.winner is None:
            if result.left_side_player.score > result.right_side_player.score:
                match.winner = match.player1
            else:
                match.winner = match.player2
        match.save()

    @database_sync_to_async
    def _is_finished(self, mode):
        if mode == 0 and self.game.match1.winner is not None:
            return True
        elif mode != 0 and self.game.match3.winner is not None:      # todo 다시 생각해야 됨
            return True
        return False

    async def _waiting_join(self, group_name, _type):
        start_time = time.time()
        while True:
            if time.time() - start_time >= 30:
                raise TimeoutError()
            num = self.channel_layer.groups[group_name].__len__()
            if _type == "game" and ((self.game.mode == 0 and num == 2) or (self.game.mode != 0 and num == 4)):
                break
            elif _type == "match" and num == 2:
                break
            await asyncio.sleep(0.3)

    @database_sync_to_async
    def _save_game_object_by_id(self):
        self.game = Game.objects.get(id=self.game_id)

    @database_sync_to_async
    def _validate_user(self, user):
        if self.game.manager.nickname == user:
            self.manager = True
            return
        elif self.game.player1.nickname == user:
            return
        elif (self.game.mode == 1 or self.game.mode == 2) and (self.game.player2.nickname == user or self.game.player3.nickname == user):
            return
        else:
            raise Exception("게임 방에 속한 유저가 아닙니다.")

    async def _get_match(self):
        if self.game.mode == 0:  # 1e1
            self.my_match = 1
            self.is_final = True
            if self.channel_layer.groups[self.game_group_name].__len__() == 1:
                await self._save_match(1)
            else:
                await self._save_match(2)
            await self.channel_layer.group_add(self.match1_group_name, self.channel_name)
        else:  # tournament
            join_num = self.channel_layer.groups[self.game_group_name].__len__()
            if join_num % 2 == 1:
                self.my_match = 1
                if join_num == 1:
                    await self._save_match(1)
                else:
                    await self._save_match(2)
                await self.channel_layer.group_add(self.match1_group_name, self.channel_name)
            else:
                self.my_match = 2
                if join_num == 2:
                    await self._save_match(1)
                else:
                    await self._save_match(2)
                await self.channel_layer.group_add(self.match2_group_name, self.channel_name)

    @database_sync_to_async
    def _save_match(self, player):
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
    def _get_serializer_data(self, final):
        serializer = None
        game = Game.objects.get(id=self.game_id)
        self.game = game
        if self.game.mode == 0:
            serializer = PvPMatchSerializer(game)
        elif self.game.mode != 0 and final is False:
            serializer = TournamentMatchSerializer(game)
        elif self.game.mode != 0 and final is True:
            serializer = TournamentFinalMatchSerializer(game)
        return serializer.data

    async def _send_match_table(self):
        serializer_data = await self._get_serializer_data(False)
        await self.channel_layer.group_send(
            self.game_group_name,
            {
                'type': 'game_info',
                'data': serializer_data
            }
        )

    async def _print_start_log(self, mode):
        if mode == 0:
            logger.info("[시작] PVP")
        elif mode == 1:
            logger.info("[시작] TOURNAMENT")
        elif mode == 2:
            logger.info("[시작] RANK")

    async def _process_game_start(self, message_data):
        if self.player1:
            if self.my_match == 1:
                await self._init_game(message_data, self.my_match)
                await self._waiting_join(self.match1_group_name, 'match')
                await self._send_start_message(self.match1, self.match1_group_name)
                await asyncio.sleep(2)
                self.match1.started_at = datetime.now()
                while not self.match1.finished and self.channel_layer.groups[self.match1_group_name].__len__() == 2:
                    await self._check_game(self.match1)
                    await self._send_in_game_message(self.match1, self.match1_group_name)
                    await asyncio.sleep(GAME_SETTINGS_DICT['play']['frame'])
                if self.channel_layer.groups[self.match1_group_name].__len__() == 2:
                    await self._save_match_data(self.my_match, self.match1, True)
                else:
                    await self._save_match_data(self.my_match, self.match1, False)
                if self.game.mode == 0:
                    await self._save_game_status(3)
                    await self._update_winner_data(self.game.mode)
                    await self._send_end_message(self.game.match1)
                else:
                    await self._save_match3_matching_in_database(self.game.match1.winner)
                    await self._send_end_message(self.game.match1)
            elif self.my_match == 2:
                await self._init_game(message_data, self.my_match)
                await self._waiting_join(self.match2_group_name, 'match')
                await self._send_start_message(self.match2, self.match2_group_name)
                await asyncio.sleep(2)
                self.match2.started_at = datetime.now()
                while not self.match2.finished and self.channel_layer.groups[self.match2_group_name].__len__() == 2:
                    await self._check_game(self.match2)
                    await self._send_in_game_message(self.match2, self.match2_group_name)
                    await asyncio.sleep(GAME_SETTINGS_DICT['play']['frame'])
                if self.channel_layer.groups[self.match2_group_name].__len__() == 2:
                    await self._save_match_data(self.my_match, self.match2, True)
                else:
                    await self._save_match_data(self.my_match, self.match2, False)
                await self._save_match3_matching_in_database(self.game.match2.winner)
                await self._send_end_message(self.game.match2)

    async def _process_match3_game_start(self, message_data):
        self.my_match = 3
        self.is_final = True
        if self.player1:
            await self._init_game(message_data, self.my_match)
            start_time = time.time()
            while True:
                if time.time() - start_time >= 30:
                    raise TimeoutError()
                num = self.channel_layer.groups[self.match3_group_name].__len__()
                if num == 2:
                    break
                await asyncio.sleep(0.3)
            await self._send_start_message(self.match3, self.match3_group_name)
            await asyncio.sleep(2)
            self.match3.started_at = datetime.now()
            while not self.match3.finished and self.channel_layer.groups[self.match3_group_name].__len__() == 2:
                await self._check_game(self.match3)
                await self._send_in_game_message(self.match3, self.match3_group_name)
                await asyncio.sleep(GAME_SETTINGS_DICT['play']['frame'])
            await self._save_game_status(3)
            await self._update_winner_data(self.game.mode)
            await self._send_end_message(self.game.match3)

    async def _send_final_match_table(self):
        serializer_data = await self._get_serializer_data(True)
        await self.channel_layer.group_send(
            self.match3_group_name,
            {
                'type': 'game_info',
                'data': serializer_data
            }
        )

    async def _process_keyboard_input(self, message_data):
        if self.player1 is False:
            if message_data == 'up':
                await self._send_data(await self._get_my_match_group_name(self.my_match), 'up')
            elif message_data == 'down':
                await self._send_data(await self._get_my_match_group_name(self.my_match), 'down')
        else:
            if message_data == 'up':
                match = await self._get_my_match_PingPongGame_object(self.my_match)
                p1_lock.acquire()
                match.left_side_player.bar.y -= GAME_SETTINGS_DICT['bar']['speed']
                p1_lock.release()
            elif message_data == 'down':
                match = await self._get_my_match_PingPongGame_object(self.my_match)
                p2_lock.acquire()
                match.left_side_player.bar.y += GAME_SETTINGS_DICT['bar']['speed']
                p2_lock.release()

    async def _send_data(self, group_name, type_):
        await self.channel_layer.group_send(
            group_name,
            {
                'type': type_,
                'sender_nickname': self.user.nickname
            }
        )

    async def _check_game(self, match):
        if match.ball.is_ball_hit_wall(match.ping_pong_map):
            match.ball.bounce((1, -1))
        elif match.ball.is_ball_inside_bar(match.left_side_player.bar) or match.ball.is_ball_inside_bar(
                match.right_side_player.bar):
            match.ball.bounce((-1, 1))
        if (whether_score_a_goal := match.ball.is_goal_in(match.ping_pong_map)) != [False, False]:
            match.update_score(whether_score_a_goal)
            match.ball.reset(match.ping_pong_map)
        if match.left_side_player.score + match.right_side_player.score == 5:
            match.finished = True
        match.ball.move()

    @database_sync_to_async
    def _init_game(self, message_data, match):
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
    def _save_match3_matching_in_database(self, winner: User):
        match = self.game.match3
        if self.my_match == 1:
            match.player1 = winner
            self.player1 = True
        else:
            match.player2 = winner
            self.player1 = False
        match.save()

    async def _send_end_message(self, match: Result):
        type_ = 'game_end'
        data = {
            'game_id': self.game_id,
            'winner': match.winner.nickname,
            'final': self.is_final,
            'game_mode': MODE_CHOICES_DICT[self.game.mode],
            'match': self.my_match
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

    async def _send_start_message(self, match, group_name):
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
                'score': match.right_side_player.score
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

    async def _send_in_game_message(self, match, group_name):
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
                'score': match.right_side_player.score
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
        try:
            await self.send(text_data=json.dumps(event))
        except autobahn.exception.Disconnected:
            logger.info("autobahn.exception.Disconnected: Attempt to send on a closed protocol 발생")

    async def game_start(self, event):
        try:
            await self.send(text_data=json.dumps(event))
        except autobahn.exception.Disconnected:
            logger.info("autobahn.exception.Disconnected: Attempt to send on a closed protocol 발생")

    async def in_game(self, event):
        try:
            await self.send(text_data=json.dumps(event))
        except autobahn.exception.Disconnected:
            logger.info("autobahn.exception.Disconnected: Attempt to send on a closed protocol 발생")

    async def game_end(self, event):
        await self.send(text_data=json.dumps(event))

    async def up(self, event):
        if event['sender_nickname'] != self.user.nickname:
            match = await self._get_my_match_PingPongGame_object(self.my_match)
            p2_lock.acquire()
            match.right_side_player.bar.y -= GAME_SETTINGS_DICT['bar']['speed']
            p2_lock.release()

    async def down(self, event):
        if event['sender_nickname'] != self.user.nickname:
            match = await self._get_my_match_PingPongGame_object(self.my_match)
            p2_lock.acquire()
            match.right_side_player.bar.y += GAME_SETTINGS_DICT['bar']['speed']
            p2_lock.release()

    async def player2_disconnect(self, event):
        if self.player1:
            # todo 겜 객체 만들어지기 전에 나갔을 때 예외처리 self.match1.finished 를 못 불러옴
            if self.game.mode == 0:
                await self._save_winner(1)
                self.match1.finished = True
            else:
                if self.my_match == 1:
                    pass
                elif self.my_match == 2:
                    pass
                else:
                    pass

    @database_sync_to_async
    def _save_winner(self, match):
        if match == 1:
            self.game.match1.winner = self.user
            self.game.match1.save()

    async def _get_my_match_PingPongGame_object(self, my_match):
        match = None
        if my_match == 1:
            match = self.match1
        elif my_match == 2:
            match = self.match2
        elif my_match == 3:
            match = self.match3
        return match

    async def _get_my_match_group_name(self, my_match):
        group_name = None
        if my_match == 1:
            group_name = self.match1_group_name
        elif my_match == 2:
            group_name = self.match2_group_name
        elif my_match == 3:
            group_name = self.match3_group_name
        return group_name

    @database_sync_to_async
    def _save_game_status(self, status):
        self.game.status = status
        self.game.save()

    @database_sync_to_async
    def _update_winner_data(self, mode):
        winner = None
        if mode == 0:
            winner = User.objects.get(id=self.game.match1.winner.id)
        else:
            winner = User.objects.get(id=self.game.match3.winner.id)
        if mode == 0:
            winner.custom_1vs1_wins = winner.custom_1vs1_wins + 1
        elif mode == 1:
            winner.custom_tournament_wins = winner.custom_tournament_wins + 1
        elif mode == 2:
            winner.rank_wins = winner.rank_wins + 1
        winner.save()
