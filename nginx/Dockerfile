FROM nginx:alpine

WORKDIR /etc/nginx


RUN mkdir -p /etc/nginx/certs && \
	apk add --no-cache openssl && \
	openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
	-subj "/C=XX/ST=XX/L=XX/O=XX/CN=localhost" \
	-keyout /etc/nginx/certs/server.key -out /etc/nginx/certs/server.crt

RUN chown -R nginx:nginx /etc/nginx/certs/server.crt && \
	chown -R nginx:nginx /etc/nginx/certs/server.key && \
	chmod -R 600 /etc/nginx/certs

COPY nginx.conf /etc/nginx/nginx.conf

CMD ["nginx", "-g", "daemon off;"]