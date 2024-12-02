import json
from channels.generic.websocket import AsyncWebsocketConsumer

class GameConsumer(AsyncWebsocketConsumer):
    # Her oda için bağlı oyuncu sayısını takip etmek için bir dict
    connected_players = {}

    async def connect(self):
        # Oda bilgilerini al
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = f'game_{self.room_name}'

        # Grupla bağlantı kur
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

        # Oyuncu sayısını güncelle
        if self.room_group_name not in self.connected_players:
            self.connected_players[self.room_group_name] = 0

        self.connected_players[self.room_group_name] += 1

        # Eğer iki oyuncu bağlandıysa oyunu başlat
        if self.connected_players[self.room_group_name] == 2:
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "start_game"
                }
            )

    async def disconnect(self, close_code):
        # Grupla bağlantıyı kes
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

        # Oyuncu sayısını güncelle
        if self.room_group_name in self.connected_players:
            self.connected_players[self.room_group_name] -= 1
            if self.connected_players[self.room_group_name] <= 0:
                del self.connected_players[self.room_group_name]

    async def receive(self, text_data):
        data = json.loads(text_data)
        action = data.get("action")

        if action == "update_paddle":
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "update_paddle",
                    "paddle_y": data["paddle_y"]
                }
            )
        elif action == "update_score":
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "update_score",
                    "score_data": data["score_data"]
                }
            )

    async def update_paddle(self, event):
        await self.send(text_data=json.dumps({
            "action": "update_paddle",
            "paddle_y": event["paddle_y"]
        }))

    async def update_score(self, event):
        await self.send(text_data=json.dumps({
            "action": "update_score",
            "score_data": event["score_data"]
        }))

    async def start_game(self, event):
        # Oyun başlama sinyalini istemcilere gönder
        await self.send(text_data=json.dumps({
            "action": "start_game"
        }))



    async def update_ball(self, event):
        # Top pozisyonunu istemcilere ilet
        await self.send(text_data=json.dumps({
            "action": "update_ball",
            "ball_data": event["ball_data"]
        }))