#!/bin/bash

echo "Connecting to Django container for migrations..."

echo "Przykład komend do migracji: "
ecgo "python manage.py makemigrations"
echo "python manage.py migrate"

sudo docker exec -it Just_ToDo_Django /bin/bash

