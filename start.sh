#!/bin/bash
set -e

echo "=============================="
echo "Uruchamianie projektu"
echo "=============================="

# Jeśli obrazy nie istnieją → build
if [[ -z "$(docker images -q just_todo_django_web 2> /dev/null)" ]]; then
    echo "Obrazy nie istnieją – buduję..."
    sudo docker-compose build
fi

# Migracje (bezpieczne do wielokrotnego uruchamiania)
echo "Migracje..."
sudo docker-compose run --rm web python manage.py migrate

# Collectstatic (też bezpieczne wielokrotnie)
echo "Collectstatic..."
sudo docker-compose run --rm web python manage.py collectstatic --noinput

# Start stacku
echo "Start stacku..."
sudo docker-compose up -d

echo "Gotowe. Logi: docker-compose logs -f"
