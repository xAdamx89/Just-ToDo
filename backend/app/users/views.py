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
from django.db.models import Q
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from .models import Task
from .serializers import TaskSerializer

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

import base64
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import EncryptedObject


class EncryptedObjectView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, object_type):
        """
        Zwraca wszystkie zaszyfrowane obiekty danego typu
        """
        objects = EncryptedObject.objects.filter(
            user=request.user,
            object_type=object_type
        )

        return Response([
            {
                "id": obj.id,
                "ciphertext": base64.b64encode(obj.ciphertext).decode(),
                "created_at": obj.created_at,
                "updated_at": obj.updated_at
            }
            for obj in objects
        ])

    def post(self, request, object_type):
        """
        Tworzy nowy zaszyfrowany obiekt
        """
        ciphertext_b64 = request.data.get("ciphertext")
        if not ciphertext_b64:
            return Response({"error": "ciphertext required"}, status=400)

        ciphertext = base64.b64decode(ciphertext_b64)

        obj = EncryptedObject.objects.create(
            user=request.user,
            object_type=object_type,
            ciphertext=ciphertext
        )

        return Response({"id": obj.id}, status=status.HTTP_201_CREATED)

    def put(self, request, object_type):
        """
        Aktualizuje istniejący obiekt
        """
        obj_id = request.data.get("id")
        ciphertext_b64 = request.data.get("ciphertext")

        if not obj_id or not ciphertext_b64:
            return Response({"error": "id and ciphertext required"}, status=400)

        try:
            obj = EncryptedObject.objects.get(
                id=obj_id,
                user=request.user,
                object_type=object_type
            )
        except EncryptedObject.DoesNotExist:
            return Response({"error": "not found"}, status=404)

        obj.ciphertext = base64.b64decode(ciphertext_b64)
        obj.save()

        return Response({"status": "updated"}, status=200)

    def delete(self, request, object_type):
        """
        Usuwa obiekt
        """
        obj_id = request.data.get("id")

        try:
            obj = EncryptedObject.objects.get(
                id=obj_id,
                user=request.user,
                object_type=object_type
            )
        except EncryptedObject.DoesNotExist:
            return Response({"error": "not found"}, status=404)

        obj.delete()
        return Response({"status": "deleted"}, status=200)

class TaskView(APIView):
    permission_classes = [IsAuthenticated]

    # =========================
    # GET - lista + filtrowanie
    # =========================
    def get(self, request):
        tasks = Task.objects.filter(user=request.user)

        # --- filtrowanie po statusie ---
        status_param = request.query_params.get("status")
        if status_param:
            tasks = tasks.filter(status=status_param)

        # --- filtrowanie po ważnych ---
        important_param = request.query_params.get("important")
        if important_param == "true":
            tasks = tasks.filter(is_important=True)

        # --- wyszukiwanie ---
        search_param = request.query_params.get("search")
        if search_param:
            tasks = tasks.filter(
                Q(title__icontains=search_param) |
                Q(description__icontains=search_param)
            )

        tasks = tasks.order_by("-created_at")

        serializer = TaskSerializer(tasks, many=True)
        return Response(serializer.data)

    # =========================
    # POST - dodanie
    # =========================
    def post(self, request):
        serializer = TaskSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # =========================
    # PUT - edycja / toggle
    # =========================
    def put(self, request):
        task_id = request.query_params.get("id")

        if not task_id:
            return Response({"error": "Task id required"}, status=400)

        try:
            task = Task.objects.get(id=task_id, user=request.user)
        except Task.DoesNotExist:
            return Response({"error": "Task not found"}, status=404)

        serializer = TaskSerializer(task, data=request.data, partial=True)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)

        return Response(serializer.errors, status=400)

    # =========================
    # DELETE - usuwanie
    # =========================
    def delete(self, request):
        task_id = request.query_params.get("id")

        if not task_id:
            return Response({"error": "Task id required"}, status=400)

        try:
            task = Task.objects.get(id=task_id, user=request.user)
        except Task.DoesNotExist:
            return Response({"error": "Task not found"}, status=404)

        task.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
