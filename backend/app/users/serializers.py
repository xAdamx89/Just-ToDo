from django.contrib.auth.models import User
from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .models import UserProfile
import base64
import os


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('username', 'password')

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            password=validated_data['password']
        )

        salt = os.urandom(16)

        UserProfile.objects.create(
            user=user,
            kdf_salt=salt,
            kdf_iterations=600000
        )

        return user
    

def safe_b64encode(value):
    if value is None:
        return None
    # jeśli value jest memoryview, zamień na bytes
    if isinstance(value, memoryview):
        value = bytes(value)
    elif not isinstance(value, (bytes, bytearray)):
        raise TypeError(f"Expected bytes, got {type(value)}")
    return base64.b64encode(value).decode()


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        user = authenticate(
            username=data['username'],
            password=data['password']
        )
        if not user:
            raise serializers.ValidationError("Nieprawidłowe dane logowania.")
        # Zwracamy użytkownika w validated_data do dalszego użycia
        data['user'] = user
        return data