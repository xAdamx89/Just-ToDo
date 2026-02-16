from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.models import User
from .serializers import RegisterSerializer, LoginSerializer, safe_b64encode
from .models import UserProfile
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.hazmat.primitives.asymmetric import x25519
from cryptography.hazmat.primitives.serialization import Encoding, PrivateFormat, PublicFormat, NoEncryption
import base64
import os
import base64
import os
from django.contrib.auth.models import User
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from .models import UserProfile
from .serializers import RegisterSerializer
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.hazmat.primitives.asymmetric import x25519
from cryptography.hazmat.primitives.serialization import Encoding, PrivateFormat, PublicFormat, NoEncryption

class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        # Utworzenie użytkownika
        response = super().create(request, *args, **kwargs)
        user = User.objects.get(username=request.data["username"])
        profile = user.userprofile

        password = request.data["password"]

        # 1️⃣ Salt do KDF
        salt = os.urandom(16)
        profile.kdf_salt = salt
        profile.kdf_iterations = 600_000  # możesz zmienić

        # 2️⃣ Wyprowadzenie klucza AES z hasła
        kdf = PBKDF2HMAC(
            algorithm=hashes.SHA256(),
            length=32,
            salt=salt,
            iterations=profile.kdf_iterations,
        )
        derived_key = kdf.derive(password.encode())  # 32b AES key
        aesgcm = AESGCM(derived_key)
        iv = os.urandom(12)

        # 3️⃣ Generacja kluczy ECDH X25519
        private_key = x25519.X25519PrivateKey.generate()
        public_key = private_key.public_key()

        # Eksport kluczy w formacie bytes
        private_bytes = private_key.private_bytes(
            encoding=Encoding.Raw,
            format=PrivateFormat.Raw,
            encryption_algorithm=NoEncryption()
        )
        public_bytes = public_key.public_bytes(
            encoding=Encoding.Raw,
            format=PublicFormat.Raw
        )

        # 4️⃣ Szyfrowanie private key AES-GCM
        encrypted_private_key = aesgcm.encrypt(iv, private_bytes, None)

        # 5️⃣ Zapis w profilu
        profile.public_key = public_bytes
        profile.encrypted_private_key = encrypted_private_key
        profile.save()

        return Response({
            "message": "User created",
            "kdf_salt": base64.b64encode(profile.kdf_salt).decode(),
            "kdf_iterations": profile.kdf_iterations,
            "public_key": base64.b64encode(profile.public_key).decode(),
            "encrypted_private_key": base64.b64encode(profile.encrypted_private_key).decode(),
            "iv": base64.b64encode(iv).decode()  # frontend potrzebuje IV do odszyfrowania
        }, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = serializer.validated_data['user']
        profile = user.userprofile

        # Generujemy JWT
        refresh = RefreshToken.for_user(user)

        # Tworzymy właściwą strukturę odpowiedzi
        response_data = {
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
            },
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "encryption": {
                "kdf_salt": safe_b64encode(profile.kdf_salt),
                "kdf_iterations": profile.kdf_iterations,  # pozostaje int
                "public_key": safe_b64encode(profile.public_key),
                "encrypted_private_key": safe_b64encode(profile.encrypted_private_key),
            }
        }

        return Response(response_data, status=status.HTTP_200_OK)
    
    
class MeView(APIView):
    def get(self, request):
        return Response({
            "id": request.user.id,
            "username": request.user.username,
            "email": request.user.email
        })

class UserDataView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        """Zwraca zaszyfrowane dane użytkownika"""
        try:
            userdata = request.user.userdata
        except UserData.DoesNotExist:
            # jeśli nie ma danych, tworzymy pusty rekord
            userdata = UserData.objects.create(user=request.user)
        return Response({
            "tasks": userdata.encrypted_tasks,
            "fifo": userdata.encrypted_fifo,
            "settings": userdata.encrypted_settings,
        })
    def post(self, request):
        """Aktualizuje zaszyfrowane dane użytkownika"""
        try:
            userdata = request.user.userdata
        except UserData.DoesNotExist:
            userdata = UserData.objects.create(user=request.user)
        # spodziewamy się, że klient wysyła już zaszyfrowane JSONy
        userdata.encrypted_tasks = request.data.get("tasks", userdata.encrypted_tasks)
        userdata.encrypted_fifo = request.data.get("fifo", userdata.encrypted_fifo)
        userdata.encrypted_settings = request.data.get("settings", userdata.encrypted_settings)
        userdata.save()
        return Response({"status": "ok"}, status=status.HTTP_200_OK)
    
    