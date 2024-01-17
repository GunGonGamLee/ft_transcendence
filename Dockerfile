FROM nikolaik/python-nodejs:python3.12-nodejs20

RUN mkdir frontend backend && \
	apt-get update && \
	apt-get install bash

# COPY frontend/package*.json ./frontend/
# RUN cd frontend && npm install

COPY backend/requirements.txt ./backend/
RUN pip install -r backend/requirements.txt

COPY backend ./backend
# COPY frontend ./frontend

EXPOSE 8000

CMD bash -c "cd backend && python manage.py runserver 0.0.0.0:8000"