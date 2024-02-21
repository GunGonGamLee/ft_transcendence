FROM hashicorp/vault:latest

RUN apk add --no-cache bash jq curl

COPY entrypoints.sh /entrypoints.sh

COPY ./config/vault.hcl /vault

RUN chmod +x /entrypoints.sh

ENTRYPOINT ["/entrypoints.sh"]