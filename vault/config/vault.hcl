listener "tcp" {
  address     = "0.0.0.0:8200"
  tls_cert_file = "/vault/certs/server.crt"
  tls_key_file = "/vault/certs/server.key"
  tls_client_ca_file = "/vault/certs/rootCA.pem"
  tls_disable_client_certs = "true"
}

storage "file" {
  path = "/vault/file"
}

api_addr = "https://hashicorp_vault:8200"

disable_mlock = true

default_lease_ttl = "168h"

max_lease_ttl = "720h"

ui = true