#!/bin/sh

python manage.py collectstatic --noinput

#exec gunicorn --bind 0.0.0.0:8000 src.wsgi:application

exec daphne -b 0.0.0.0 -p 8000 src.asgi:application

# exec python3 manage.py runserver 0.0.0.0:8000