FROM nginx:1.21.6-alpine

# 필요한 패키지 설치
RUN apk add --no-cache git build-base libtool automake autoconf zlib-dev pcre-dev openssl-dev linux-headers openssl

# # ModSecurity 다운로드 및 컴파일
RUN git clone --depth 1 https://github.com/SpiderLabs/ModSecurity.git /usr/local/src/modsecurity \
    && cd /usr/local/src/modsecurity \
    && git submodule init \
    && git submodule update \
    && ./build.sh \
    && ./configure \
    && make \
    && make install

# ModSecurity-nginx 커넥터 다운로드
RUN git clone --depth 1 https://github.com/SpiderLabs/ModSecurity-nginx.git /usr/local/src/modsecurity-nginx

# Nginx 컴파일을 위한 준비 및 ModSecurity 모듈 빌드
ARG NGINX_VERSION=1.21.6
RUN wget https://nginx.org/download/nginx-${NGINX_VERSION}.tar.gz \
    && tar zxvf nginx-${NGINX_VERSION}.tar.gz \
    && cd nginx-${NGINX_VERSION} \
    && ./configure --with-compat --add-dynamic-module=/usr/local/src/modsecurity-nginx \
    && make modules \
    && cp objs/ngx_http_modsecurity_module.so /usr/lib/nginx/modules

# SSL 인증서 생성
RUN mkdir -p /etc/nginx/certs && \
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -subj "/C=XX/ST=XX/L=XX/O=XX/CN=localhost" \
    -keyout /etc/nginx/certs/server.key -out /etc/nginx/certs/server.crt \
    && chown -R nginx:nginx /etc/nginx/certs/server.* && \
    chmod -R 600 /etc/nginx/certs/server.*

# ModSecurity 설정 디렉토리 생성 및 파일 복사
RUN mkdir -p /etc/nginx/modsecurity
COPY ./config/modsecurity.conf /etc/nginx/modsecurity/
COPY ./config/owasp-crs /etc/nginx/modsecurity/owasp-crs

# Nginx 설정 파일 복사 및 모듈 로드
COPY ./config/nginx.conf /etc/nginx/nginx.conf

RUN mkdir -p /etc/nginx/modules-load.d/ \
    && echo 'load_module /usr/lib/nginx/modules/ngx_http_modsecurity_module.so;' > /etc/nginx/modules-load.d/00-modsecurity.conf \
    && cat /etc/nginx/nginx.conf > /etc/nginx/nginx.conf.bak \
    && cat /etc/nginx/modules-load.d/00-modsecurity.conf /etc/nginx/nginx.conf.bak > /etc/nginx/nginx.conf

CMD ["nginx", "-g", "daemon off;"]
