#!/bin/bash

# Assumes a persistent disk exists at /etc that can be used to store certificates

RESTY_CONF_DIR="/usr/local/openresty/nginx/conf"

mkdir -p /etc/resty-auto-ssl/letsencrypt/conf.d

# openresty will change it later on his own, right now we're just giving it access
chmod 777 /etc/resty-auto-ssl

# Check if dhparam.pem has already been generated, otherwise copy it
if [ ! -f "/etc/resty-auto-ssl/dhparam.pem" ]; then
  openssl dhparam -out /etc/resty-auto-ssl/dhparam.pem 2048
fi

if [ ! -f "/etc/resty-auto-ssl/resty-auto-ssl-fallback.key" ]; then
  openssl req -new -newkey rsa:2048 -days 3650 -nodes -x509 -subj '/CN=sni-support-required-for-valid-ssl' -keyout /etc/resty-auto-ssl/resty-auto-ssl-fallback.key -out /etc/resty-auto-ssl/resty-auto-ssl-fallback.crt
fi

envsubst '$SERVER_ENDPOINT' \
	< ${RESTY_CONF_DIR}/nginx.conf.template \
	> ${RESTY_CONF_DIR}/nginx.conf

echo "CONTACT_EMAIL='support@originprotocol.com'" > /etc/resty-auto-ssl/letsencrypt/conf.d/dehydrated.conf

exec "$@"
