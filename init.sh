#!/bin/sh

python manage.py collectstatic --noinput

daphne -b 0.0.0.0 -e ssl:8443:privateKey=/backend/certs/server.key:certKey=/backend/certs/server.crt src.asgi:application