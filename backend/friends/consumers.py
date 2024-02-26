from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from asgiref.sync import sync_to_async
import json
from friends.models import Friend
from django.conf import settings
import logging
from users.models import User
import asyncio

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
            await set_user_online(self.user.id, online=True)
            logger.info(f"Websocket connection established for user {self.user.id}")
            self.send_update_task = asyncio.create_task(self.send_updates_periodically())

    async def disconnect(self, close_code):
        if self.user.is_authenticated:
            # 사용자 접속 해제 처리
            await self.channel_layer.group_discard(
                f"friend_status_{self.user.id}",
                self.channel_name
            )
            # 친구들에게 접속 해제 상태 업데이트 전송
            await set_user_online(self.user.id, online=False)
            logger.info(f"Websocket connection closed for user {self.user.id}")
            if hasattr(self, 'send_update_task') and self.send_update_task:
                self.send_update_task.cancel()
                try:
                    await self.send_update_task
                except asyncio.CancelledError:
                    logger.info("Periodic updates task cancelled.")
        
            
    async def send_updates_periodically(self):
        try:
            while True:
                await asyncio.sleep(5)
                await self.send_combined_updates()
        except asyncio.CancelledError:
            pass
        
    async def send_combined_updates(self):
        friends_info = await self.get_friends_info()
        pending_requests_info = await self.get_pending_requests_info()


        combined_data = {
            'type' : 'update',
            'data' : {
                'friends' : friends_info,
                'friendRequestList': pending_requests_info,
            }
        }
        await self.send(text_data=json.dumps(combined_data))
        
    @sync_to_async
    def get_friends_info(self):
        current_user = self.user
        friends_relations = Friend.objects.filter(user_id=current_user, status=1) \
            | Friend.objects.filter(friend_id=current_user, status=1)
        friends = []
        for relation in friends_relations:
            friend = relation.friend_id if relation.user_id == current_user else relation.user_id
            friend_data = {
                'nickname' : friend.nickname,
                'is_online' : friend.is_online,
                'avatar': str(friend.avatar).split('/')[-1],
            }
            friends.append(friend_data)
        return friends
        
    @sync_to_async
    def get_pending_requests_info(self):
        current_user = self.user
        friend_requests = Friend.objects.filter(friend_id=current_user, status=0)
        
        friendRequestList = []
        for request in friend_requests:
            user = request.user_id
            user_data = {
                'nickname': user.nickname,
                'is_online': user.is_online,
                'avatar': str(user.avatar).split('/')[-1],
            }
            friendRequestList.append(user_data)
        return friendRequestList
        

    @database_sync_to_async
    def get_user_friends(self):
        user_friends = Friend.objects.filter(user_id=self.user.id, status = 1).values_list('friend_id', flat=True)
        friend_users = Friend.objects.filter(friend_id=self.user.id, status = 1).values_list('user_id', flat=True)
        return list(user_friends) + list(friend_users)
    
