from django.db import models
from django.contrib.auth.models import User


class EncryptedTask(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    encrypted_data = models.BinaryField()
    created_at = models.DateTimeField(auto_now_add=True)

class EncryptedFifo(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    encrypted_data = models.BinaryField()
    created_at = models.DateTimeField(auto_now_add=True)

