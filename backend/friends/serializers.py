from rest_framework import serializers
from users.models import Friend

class FriendSerializer(serializers.ModelSerializer):
	class meta:
		model = Friend
		fields = ('id', 'user_id', 'friend_id', 'created_at', 'updated_at')