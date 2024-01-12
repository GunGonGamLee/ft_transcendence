listener "tcp" {
  address     = "0.0.0.0:8200"
  tls_disable = 1
}

storage "file" {
  path = "/vault/file"
}

api_addr = "http://localhost:8200"

disable_mlock = true

default_lease_ttl = "168h"

max_lease_ttl = "720h"

ui = true