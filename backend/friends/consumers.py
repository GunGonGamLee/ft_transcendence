from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
import json
from friends.models import Friend
from django.conf import settings
import logging
from users.models import User

logger = logging.getLogger(__name__)

@database_sync_to_async
def set_user_online(user_id, online=True):
    User.objects.filter(id=user_id).update(is_online=online)

class FriendStatusConsumer(AsyncWebsocketConsumer):    
    async def connect(self):
        self.user = self.scope["user"]
        if self.user.is_authenticated:
            # 사용자 접속 처리
            await self.channel_layer.group_add(
                f"friend_status_{self.user.id}",
                self.channel_name
            )
            await self.accept()
            # 친구들에게 접속 상태 업데이트 전송
            # await self.notify_friends_online()
            await set_user_online(self.user.id, online=True)
            logger.info(f"Websocket connection established for user {self.user.id}")
        else:
            logger.info("Websocket connection rejected")

    async def disconnect(self, close_code):
        if self.user.is_authenticated:
            # 사용자 접속 해제 처리
            await self.channel_layer.group_discard(
                f"friend_status_{self.user.id}",
                self.channel_name
            )
            # 친구들에게 접속 해제 상태 업데이트 전송
            await self.notify_friends_offline()
            await set_user_online(self.user.id, online=False)
            logger.info(f"Websocket connection closed for user {self.user.id}")

    async def notify_friends_online(self):
        # 여기에 친구들에게 사용자가 온라인임을 알리는 코드를 추가
        friends = await self.get_user_friends()
        for friend_id in friends:
            await self.channel_layer.group_send(
                f"friend_status_{friend_id}",
                {
                    'type': 'friend_status_message',
                    'message': {'user_id': self.user.id, 'status': 'online'}
                }
            )

    async def notify_friends_offline(self):
        # 여기에 친구들에게 사용자가 오프라인임을 알리는 코드를 추가
        friends = await self.get_user_friends()
        for friend_id in friends:
            await self.channel_layer.group_send(
                f"friend_status_{friend_id}",
                {
                    'type': 'friend_status_message',
                    'message': {'user_id': self.user.id, 'status': 'offline'}
                }
            )
            
    async def friend_status_message(self, event):
        if event['message']['status'] == 'offline':
            await self.close()

    @database_sync_to_async
    def get_user_friends(self):
        user_friends = Friend.objects.filter(user_id=self.user.id, status = 1).values_list('friend_id', flat=True)
        friend_users = Friend.objects.filter(friend_id=self.user.id, status = 1).values_list('user_id', flat=True)
        return list(user_friends) + list(friend_users)