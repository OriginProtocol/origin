#!/bin/bash

# Assumes a persistent disk exists at /data that can be used to store certificates

RESTY_CONF_DIR="/usr/local/openresty/nginx/conf"
NGINX_CONF_DIR="/etc/nginx/conf.d"

mkdir -p /data/resty-auto-ssl

# openresty will change it later on his own, right now we're just giving it access
chmod 777 /data/resty-auto-ssl

# Check if dhparam.pem has already been generated, otherwise copy it
if [ ! -f "/data/resty-auto-ssl/dhparam.pem" ]; then
  openssl dhparam -out /data/resty-auto-ssl/dhparam.pem 2048
else
  cp ${RESTY_CONF_DIR}/dhparam.pem /data/resty-auto-ssl/dhparam.pem
fi

if [ ! -f "/data/resty-auto-ssl/resty-auto-ssl-fallback.key" ]; then
  openssl req -new -newkey rsa:2048 -days 3650 -nodes -x509 -subj '/CN=sni-support-required-for-valid-ssl' -keyout /data/resty-auto-ssl-fallback.key -out /data/resty-auto-ssl-fallback.crt
fi

envsubst '$LETSENCRYPT_URL' \
  < ${RESTY_CONF_DIR}/resty-http.conf \
  > ${RESTY_CONF_DIR}/resty-http.conf.copy \
  && mv ${RESTY_CONF_DIR}/resty-http.conf.copy ${RESTY_CONF_DIR}/resty-http.conf

exec "$@"
