#!/bin/bash
set -e

# Migracje Django
echo "Uruchamiam migracje..."
python manage.py migrate

# Tworzenie superusera jeśli nie istnieje
echo "Tworzę superusera (jeśli nie istnieje)..."
python manage.py shell << END
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(username='$DJANGO_SUPERUSER_USERNAME').exists():
    User.objects.create_superuser('$DJANGO_SUPERUSER_USERNAME', '$DJANGO_SUPERUSER_EMAIL', '$DJANGO_SUPERUSER_PASSWORD')
END

# Uruchom Gunicorn
echo "Uruchamiam Gunicorn..."
exec gunicorn ToDoProject.wsgi:application --bind 0.0.0.0:8000
