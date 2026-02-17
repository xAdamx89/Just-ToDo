from django.db import models
import os
from django.contrib.auth.models import User


class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)

    # KDF
    kdf_salt = models.BinaryField()
    kdf_iterations = models.IntegerField(default=600000)

    # Asymetryka
    public_key = models.BinaryField(null=True, blank=True)
    encrypted_private_key = models.BinaryField(null=True, blank=True)

    # wersjonowanie
    crypto_version = models.IntegerField(default=1)

    created_at = models.DateTimeField(auto_now_add=True)

# Object_type może być "task", "fifo" lub "settings". To pozwala nam przechowywać różne typy danych w jednym modelu, ale nadal rozróżniać je po typie.
class EncryptedObject(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="encrypted_objects")
    object_type = models.CharField(max_length=32)
    ciphertext = models.BinaryField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class Task(models.Model):

    PRIORITY_CHOICES = [
        ("low", "Low"),
        ("medium", "Medium"),
        ("high", "High"),
        ("critical", "Critical"),
    ]

    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("in_progress", "In Progress"),
        ("completed", "Completed"),
        ("cancelled", "Cancelled"),
    ]

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="tasks"
    )

    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)

    priority = models.CharField(
        max_length=16,
        choices=PRIORITY_CHOICES,
        default="medium"
    )

    status = models.CharField(
        max_length=16,
        choices=STATUS_CHOICES,
        default="pending"
    )

    is_important = models.BooleanField(default=False)

    deadline = models.DateField(null=True, blank=True)

    created_at = models.DateField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} ({self.user.username})"

