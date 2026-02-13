#!/bin/bash
set -e

echo "=============================="
echo "Przebudowa obrazów i restart stacku"
echo "=============================="

sudo docker compose down

# 1. Przebudowa obrazów
echo "Budowanie obrazów..."
sudo docker-compose build

# 2. Restart stacku w tle
echo "Restartowanie stacku w tle..."
sudo docker-compose up -d

echo "Stack uruchomiony w tle. Sprawdź logi poleceniem 'docker-compose logs -f'"

if [ $1 == "migrate" ]; then
    echo "Wykonywanie migracji..."
    sudo docker-compose run --rm web python manage.py migrate
    sudo docker-compose run --rm web python manage.py collectstatic --noinput
fi