import asyncio
import json
from channels.generic.websocket import AsyncWebsocketConsumer

class GameConsumer(AsyncWebsocketConsumer):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.room_name = None
        self.room_group_name = None
        self.paddle_positions = {"player_1": 40, "player_2": 40}
        self.ball_position = {"x": 400, "y": 250}
        self.ball_velocity = {"dx": 5, "dy": 5}
        self.scores = {"player_1": 0, "player_2": 0}
        self.players = set()  # Bağlı oyuncuları tutmak için set kullanılıyor

    async def connect(self):
        try:
            self.room_name = self.scope['url_route']['kwargs']['room_name']
            self.room_group_name = f'game_{self.room_name}'
            print(f"Bağlanılan oda: {self.room_name}")
        except KeyError as e:
            print(f"URL parametre hatası: {e}")
            await self.close()
            return

        if self.room_name not in self.roles:
            self.roles[self.room_name] = {}

        # Oyuncuyu gruba ekle
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name,
        )
        await self.accept()

        # Rol atama
        if len(self.roles[self.room_name]) == 0:
            self.roles[self.room_name][self.channel_name] = "player_1"
        elif len(self.roles[self.room_name]) == 1:
            self.roles[self.room_name][self.channel_name] = "player_2"
        else:
            # Oda dolu
            await self.close()
            return

        role = self.roles[self.room_name][self.channel_name]

        await self.send(text_data=json.dumps({
            "event": "connected",
            "role": role,
        }))

        if len(self.roles[self.room_name]) == 2:
            await self.start_game()


    async def disconnect(self, close_code):
        if self.room_name in self.roles and self.channel_name in self.roles[self.room_name]:
            del self.roles[self.room_name][self.channel_name]

            # Oda tamamen boşsa temizle
            if not self.roles[self.room_name]:
                del self.roles[self.room_name]

        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name,
        )


    async def receive(self, text_data):
        data = json.loads(text_data)
        role = data.get("role")

        if self.room_name in self.roles and self.channel_name in self.roles[self.room_name]:
            expected_role = self.roles[self.room_name][self.channel_name]
            if role != expected_role:
                return  # Hatalı rol, işlem yapma

    async def game_loop(self):
        while True:
            self.ball_position["x"] += self.ball_velocity["dx"]
            self.ball_position["y"] += self.ball_velocity["dy"]

            # Duvarlardan sekme
            if self.ball_position["y"] <= 0 or self.ball_position["y"] >= 500:
                self.ball_velocity["dy"] *= -1

            # Paddle çarpışmaları
            if (self.ball_position["x"] <= 20 and
                self.paddle_positions["player_1"] <= self.ball_position["y"] <= self.paddle_positions["player_1"] + 100):
                self.ball_velocity["dx"] *= -1

            if (self.ball_position["x"] >= 780 and
                self.paddle_positions["player_2"] <= self.ball_position["y"] <= self.paddle_positions["player_2"] + 100):
                self.ball_velocity["dx"] *= -1

            # Skor güncellemesi
            if self.ball_position["x"] <= 0:
                self.scores["player_2"] += 1
                self.reset_ball()
            elif self.ball_position["x"] >= 800:
                self.scores["player_1"] += 1
                self.reset_ball()

            # Konumları tüm istemcilere gönder
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "update_state",
                    "paddle_positions": self.paddle_positions,
                    "ball_position": self.ball_position,
                    "scores": self.scores,
                }
            )

            await asyncio.sleep(0.03)  # ~30 FPS

    async def update_state(self, event):
        await self.send(text_data=json.dumps({
            "event": "update",
            "paddle_positions": event["paddle_positions"],
            "ball_position": event["ball_position"],
            "scores": event["scores"],
            "player_count": event["player_count"],
            "roles": event["roles"],
        }))

    def reset_ball(self):
        self.ball_position = {"x": 400, "y": 250}
        self.ball_velocity["dx"] *= -1