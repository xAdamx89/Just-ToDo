from rest_framework import serializers
from .models import EncryptedTask

class EncryptedTaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = EncryptedTask
        fields = ["id", "encrypted_data", "created_at"]

