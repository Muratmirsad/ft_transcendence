from channels.generic.websocket import AsyncWebsocketConsumer
from channels.layers import get_channel_layer
import json

class GameConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = self.scope["url_route"]["kwargs"]["room_name"]
        self.room_group_name = f"game_{self.room_name}"

        # Kanal grubuna katıl
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name,
        )
        await self.accept()

    async def disconnect(self, close_code):
        # Kanal grubundan ayrıl
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name,
        )

    async def receive(self, text_data):
        data = json.loads(text_data)
        if data["event"] == "move":
            # Hareket bilgilerini diğer oyuncuya ilet
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "game_update",
                    "paddle_y": data.get("paddle_y"),
                },
            )

    async def game_update(self, event):
        # Güncellemeyi istemcilere gönder
        await self.send(text_data=json.dumps(event))
