from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
import json
from friends.models import Friend

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
            await self.notify_friends_online()

    async def disconnect(self, close_code):
        if self.user.is_authenticated:
            # 사용자 접속 해제 처리
            await self.channel_layer.group_discard(
                f"friend_status_{self.user.id}",
                self.channel_name
            )
            # 친구들에게 접속 해제 상태 업데이트 전송
            await self.notify_friends_offline()

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

    @database_sync_to_async
    def get_user_friends(self):
        user_friends = Friend.objects.filter(user_id=self.user.id, status = 1).values_list('friend_id', flat=True)
        friend_users = Friend.objects.filter(friend_id=self.user.id, stauts = 1).value_list('user_id', flat=True)
        return list(user_friends) + list(friend_users)
    