#!/bin/bash

# Assumes a persistent disk exists at /data that can be used to store certificates

RESTY_CONF_DIR="/usr/local/openresty/nginx/conf"
NGINX_CONF_DIR="/etc/nginx/conf.d"

# openresty will change it later on his own, right now we're just giving it access
chmod 777 /etc/resty-auto-ssl

# Check if dhparam.pem has already been generated, otherwise copy it
if [ ! -f "/data/resty-auto-ssl/dhparam.pem" ]; then
  if [ -n "$DIFFIE_HELLMAN" ]; then
    openssl dhparam -out /data/resty-auto-ssl/dhparam.pem 2048
  else
    cp ${RESTY_CONF_DIR}/dhparam.pem /data/resty-auto-ssl/dhparam.pem
  fi
fi

cp ${RESTY_CONF_DIR}/server-default.conf ${NGINX_CONF_DIR}/default.conf

if [ "$FORCE_HTTPS" == "true" ]; then
  # only do this, if it's first run
  if ! grep -q "force-https.conf" ${RESTY_CONF_DIR}/resty-server-http.conf
  then
    echo "include force-https.conf;" >> ${RESTY_CONF_DIR}/resty-server-http.conf
  fi
fi

envsubst '$LETSENCRYPT_URL' \
  < ${RESTY_CONF_DIR}/resty-http.conf \
  > ${RESTY_CONF_DIR}/resty-http.conf.copy \
  && mv ${RESTY_CONF_DIR}/resty-http.conf.copy ${RESTY_CONF_DIR}/resty-http.conf

exec "$@"
