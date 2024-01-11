FROM hashicorp/vault:latest

COPY entrypoints.sh /entrypoints.sh

COPY ./config/vault.hcl /vault/config/vault.hcl

RUN chmod +x /entrypoints.sh && \
	apk add --no-cache jq

ENTRYPOINT ["/entrypoints.sh"]