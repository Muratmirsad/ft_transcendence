from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.exceptions import AuthenticationFailed
from django.contrib.auth import get_user_model
import jwt
import datetime

User = get_user_model()

class LoginView(APIView):
    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        
        if not email or not password:
            return Response({'error': 'Please provide both email and password'}, status=400)

        user = User.objects.filter(email=email).first()

        if user is None:
            raise AuthenticationFailed("User not found!")

        if not user.check_password(password):
            raise AuthenticationFailed("Incorrect password!")
        
        # Kullanıcı durumu güncellemesi
        user.status = True
        user.save()

        # JWT yükü
        payload = {
            'id': user.id,
            'name': user.name,
            'email': user.email,
            'username': user.username,
            'is_uploadpp': user.is_uploadpp,
            'exp': datetime.datetime.utcnow() + datetime.timedelta(minutes=60),
            'iat': datetime.datetime.utcnow()
        }

        # JWT token oluşturma
        token = jwt.encode(payload, 'secret', algorithm='HS256')
        
        # Yanıt oluşturma
        response = Response()
        response.set_cookie(key='jwt', value=token, httponly=False)
        response.data = {
            'token': token,
        }
        return response

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import UserSerializer

class RegisterView(APIView):
    def post(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()  # Kullanıcı kaydediliyor
            return Response({'message': 'User created successfully'}, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LogoutView(APIView):
    def post(self, request):
        email = request.data.get('email')
        user = User.objects.filter(email=email).first()
        
        if user:
            # Kullanıcıyı bulduysa status'u false yap
            user.status = False
            user.save()

        # Çerezleri sil
        response = Response()
        response.delete_cookie('jwt')
        response.delete_cookie('2fa')
        response.data = {
            'message': 'success'
        }
        return response


def home(request):
    return HttpResponse("Welcome to the homeasdasdasd page!")

