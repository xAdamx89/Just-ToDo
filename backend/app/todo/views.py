from django.shortcuts import render
from rest_framework import viewsets, permissions
from .models import EncryptedTask
from .serializer import EncryptedTaskSerializer

class EncryptedTaskViewSet(viewsets.ModelViewSet):
    serializer_class = EncryptedTaskSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return EncryptedTask.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

