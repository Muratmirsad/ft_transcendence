"""
ASGI config for transcendence_app project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.1/howto/deployment/asgi/
"""

import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
import transcendence_app.routing  # Routing dosyasını içe aktarın

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'transcendence_app.settings')

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": AuthMiddlewareStack(
        URLRouter(
            transcendence_app.routing.websocket_urlpatterns
        )
    ),
})
