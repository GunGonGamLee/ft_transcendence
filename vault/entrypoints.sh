#!/bin/sh

vault server -config=/vault/vault.hcl &
sleep 5

echo "Waiting for Vault server to start..."

export VAULT_CACERT=/vault/certs/rootCA.pem

# Check if Vault is already initialized by checking for the existence of the unseal key and root token files
if [ ! -f /vault/config/unseal.key ] || [ ! -f /vault/config/root.token ]; then
  echo "Initializing Vault..."
  VAULT_INIT_RESPONSE=$(vault operator init -key-shares=1 -key-threshold=1 -format=json)
  UNSEAL_KEY=$(echo $VAULT_INIT_RESPONSE | jq -r ".unseal_keys_b64[0]")
  ROOT_TOKEN=$(echo $VAULT_INIT_RESPONSE | jq -r ".root_token")

  echo $UNSEAL_KEY > /vault/config/unseal.key
  echo $ROOT_TOKEN > /vault/config/root.token
else
  UNSEAL_KEY=$(cat /vault/config/unseal.key)
  ROOT_TOKEN=$(cat /vault/config/root.token)
fi

echo "Unsealing Vault..."
vault operator unseal $UNSEAL_KEY

echo "Logging into Vault..."
vault login $ROOT_TOKEN

wait