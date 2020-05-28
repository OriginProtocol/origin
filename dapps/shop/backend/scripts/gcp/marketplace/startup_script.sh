echo "DSHOP setup beginning!"

cat > ~/setup_script.sh << 'FULL_SCRIPT_DELIMITER'
set -e
set -x

CODENAME=`grep -Po 'VERSION="[0-9]+ \(\K[^)]+' /etc/os-release`

#################
# Server packages
#################
curl -sL https://deb.nodesource.com/setup_10.x | bash -
apt update
apt upgrade -y
apt-get install -y nodejs build-essential git wget gnupg ca-certificates
npm install -g yarn pm2

###################
# Openresty install
###################
wget -O - https://openresty.org/package/pubkey.gpg | sudo apt-key add -
echo "deb http://openresty.org/package/debian $CODENAME openresty" \
    | sudo tee /etc/apt/sources.list.d/openresty.list
apt-get update
apt-get -y install openresty luarocks
luarocks install lua-resty-auto-ssl
mkdir /etc/resty-auto-ssl
chown www-data:www-data /etc/resty-auto-ssl
openssl req -new -newkey rsa:2048 -days 3650 -nodes -x509 \
    -subj '/CN=sni-support-required-for-valid-ssl' \
    -keyout /etc/ssl/resty-auto-ssl-fallback.key \
    -out /etc/ssl/resty-auto-ssl-fallback.crt

###############
# Install dshop
###############
useradd dshop
mkdir /home/dshop
chown dshop:dshop /home/dshop
mkdir /app
cd /app
git clone https://github.com/OriginProtocol/dshop.git
cd /app/dshop/
echo ENCRYPTION_KEY="\"`openssl rand -base64 48`\"" > .env
yarn install
npm run migrate
chown -R dshop:dshop .

##########################
# PM2 to run dshop process
##########################
sudo -u dshop pm2 start app.js 
sudo -u dshop pm2 save
sudo env PATH="$PATH:/usr/bin" pm2 startup systemd -u dshop --hp /home/dshop

###############################
# Auth for BigQuery read access
###############################
export GOOGLE_APPLICATION_CREDENTIALS="/home/dshop/service_creds.json"
echo "ewogICJ0eXBlIjogInNlcnZpY2VfYWNjb3VudCIsCiAgInByb2plY3RfaWQiOiAib3JpZ2luLTIxNDUwMyIsCiAgInByaXZhdGVfa2V5X2lkIjogIjBmMGUzZmVmYjVhYjc1NjFjYWU0ZWM3MDYyOGZjZWI3NWFkODIzNmYiLAogICJwcml2YXRlX2tleSI6ICItLS0tLUJFR0lOIFBSSVZBVEUgS0VZLS0tLS1cbk1JSUV2UUlCQURBTkJna3Foa2lHOXcwQkFRRUZBQVNDQktjd2dnU2pBZ0VBQW9JQkFRQzJhYVVoc0RGSWwxeW1cbmdsZXRYZ1NsTS9IYm1PZTRlZDdVVjV4OTkyQ1UzRkdJTXErUGZUSW5WT01lTXl0Q3ZiUytKaEVHMlFBUzY2NkJcbjdaU0l1TjVEbElYOHM3aUk0c0Z5ZU9jeVB3N0FOVVhRZWtSQXZaZGdVY08wcUhLeVZkQVl5L1BMa3J2Tllna05cbmF2SWwwUEFEUDEvYjdxVFhybkR4L0tOTlpsNS9BN0FRNjVoczhiYnpCUmFUeWh3OEp0NmFwNE9YcVdteFJWY1FcblNoVGVFN2pPTnZ5anpUbndSaDdNck5neDdERFpyNkduME8yZzRUZnBtUmg3a2xjejZ0T0ZWaGxYc1VUNXg5eWdcbllxK2VoK3Z5dWJFY3lFa0NvcDZwOTlVWlNYMk0rK3ZhdDlMR2NsN3cwM3J1RDkxK1R6Y3NwdVp1bllmRkdqaW1cbmhYY3NlR1NsQWdNQkFBRUNnZ0VBVU5nS2lSOHpBSGFnNStVTm9iYncvUnpEL0t6TVNmeXRUdFBUZGhxTWtmMEJcbkg0bERPS2RtY25zVE8zKzNGUm5Kd0pwVFlvTUxIdGVZWEZva3dlR1pGRDkva0l0QVpsNkZHTXhQdnZ1bWVIWkRcbnprMVo4WTExU1FtRDRJM2xZM2RYeHAyaG02QVpIc0hydkNnaFVMUkVvMVBUa3NBMkM2Ynl4TFRRMVUxZzVRNUlcblRqNjRDdjdlQ0ZCKzhSV0ZJUjNqczdZUmdjLzBKUnNXZ2JjbXhUV0ZMOWJJeEttOERnWW9ueHFVZWt6bzdwQlZcbittSGxuandTTllVUDNrQzJFZVdQZkF4ZGFNc0hkOFpucUlOZk9DTHovMEFwVVBkay9aMS9BaHlFcWUzZ2pBODdcbkE1dFhna05ibEpQWHl0bFBwSHUrNWlXYW5heTNwVDdKdWxMdUJUa0g4d0tCZ1FEWWlWV0ZTZjUyZ1F0Z0pyTC9cbjJ5SE9mYlJWYitKWkEyQmNqZzNDR0ZQbW01MFBEUjVHOUJzbFREODZPLzM3bCtIMnVXY3RrS25jOGpaWCt2dUhcbkdKZmN6R2pveCtISG14TnJkSkpNenhWT21ZdFBrN3ZweHJXVVpQclJLT2N2aUlRNWh1Y2dYbjJoTE1lUzBON2RcbktMUGFUbHdEMXpSMDkrRlBoR0FkVGovTnN3S0JnUURYcUQyeE45dHpMellDZVpXSWxIS293ZmFPOWx2MDBxZVNcbmRhdVVXMXNhVUNVdk8rTnhKYlNKMkwvRDAxd0o0NkZrTkJDZDRNWkdlMzBGdVFnZXAyd0pHUnpGYVZrS0VmRktcbjkvaWh4N2lQTjlaYmZ5M3hxVThuWGY0a0lKY3FYS2owdnJKUGVhSVlsblpoNTc1dWJLa0dic2tGV2JjeUhnVERcbnFrVENuMlJJUndLQmdRRFdGT0ZpaUVkMnJocXJFMWZCc2NyNHRqdEdoUG1KKzlhWGF6S2JCU1plUnRlKys3OUZcbmN5NHJiL2pMQUdrWkI0NjJPWk9TN3dXaGxpNjRTVUhJelQzSFpLa01EQ0pqRUNUaEJqMW1odzZQeVNwOG9Ka1dcbmhna2NEOElTYkpnMDNJbXR2bnhmK2t2R3Y5a0loRXp5NXJ6NlJxS2VnWFF4ZUtsZnpvYWdNcTdPRlFLQmdFN3Vcbm1oM3FGdDB5MDI3V2QzKzA3YjZNdDZTZDBReHJxYisyWitWMkJvTThBRkFvZUZlcWVFalgxMkJpVk5hZHhTMTZcbnpQWXNGZ1lvSHB0Z25QTXpUaHlLWDNoMTFZd1ZBeDd3WWNVODUzVXI5NzRuYjNaN0JLaWhBMnJQcnVSblk4T29cbnBIVG9UUWI0MHoyRVo3UGMrNFNLT2ZOR1lnSHE4TTE0M1kvcWJQYnpBb0dBZGdrWEYwZUVudUdhY00vRm1lYndcbmZHZS9QZXcrSmVKMVFiWElCSHRHSmgwRWRHa2JqckZBSTRsL3ZFUWZpc1hUR3RBZkkxZmhXSEM4VEd2bGFISHJcbjFySFlXMXZIaGcrbDMwbnF2TkJoRzhQNnFqWWFqQ1JsUmo0RWswcHNtWXlBK3ZQM2FQa3lDVWdmSkdDSHV5OXNcblZ2UmM3cFVGK1AxYXdieU9INGFZY0hNPVxuLS0tLS1FTkQgUFJJVkFURSBLRVktLS0tLVxuIiwKICAiY2xpZW50X2VtYWlsIjogImJpcXVlcnktcmVhZGVyQG9yaWdpbi0yMTQ1MDMuaWFtLmdzZXJ2aWNlYWNjb3VudC5jb20iLAogICJjbGllbnRfaWQiOiAiMTAzMjIyOTIxOTA3MzE5MDc0MTUzIiwKICAiYXV0aF91cmkiOiAiaHR0cHM6Ly9hY2NvdW50cy5nb29nbGUuY29tL28vb2F1dGgyL2F1dGgiLAogICJ0b2tlbl91cmkiOiAiaHR0cHM6Ly9vYXV0aDIuZ29vZ2xlYXBpcy5jb20vdG9rZW4iLAogICJhdXRoX3Byb3ZpZGVyX3g1MDlfY2VydF91cmwiOiAiaHR0cHM6Ly93d3cuZ29vZ2xlYXBpcy5jb20vb2F1dGgyL3YxL2NlcnRzIiwKICAiY2xpZW50X3g1MDlfY2VydF91cmwiOiAiaHR0cHM6Ly93d3cuZ29vZ2xlYXBpcy5jb20vcm9ib3QvdjEvbWV0YWRhdGEveDUwOS9iaXF1ZXJ5LXJlYWRlciU0MG9yaWdpbi0yMTQ1MDMuaWFtLmdzZXJ2aWNlYWNjb3VudC5jb20iCn0K" | base64 -d > $GOOGLE_APPLICATION_CREDENTIALS
echo 'GOOGLE_APPLICATION_CREDENTIALS=/home/dshop/service_creds.json' >> /app/dshop/.env
echo 'BIG_QUERY_TABLE=origin-214503.dshop.products' >> /app/dshop/.env

####################################
# Openresty config to proxy to dshop
####################################
cat > /etc/openresty/nginx.conf << 'EOM'
worker_processes  1;
user www-data www-data;

events {
    worker_connections  1024;
}

http {
    include         mime.types;
    default_type    application/octet-stream;
    sendfile        on;
    keepalive_timeout  65;

    # lua-resty-auto-ssl Settings
    # Ref: https://github.com/auto-ssl/lua-resty-auto-ssl
    lua_shared_dict auto_ssl 1m;
    lua_shared_dict auto_ssl_settings 64k;
    resolver 8.8.8.8;

    init_by_lua_block {
        auto_ssl = (require "resty.auto-ssl").new()

        -- Define a function to determine which SNI domains to automatically handle
        -- and register new certificates for. Defaults to not allowing any domains,
        -- so this must be configured.
        auto_ssl:set("allow_domain", function(domain)
          return true
        end)

        auto_ssl:init()
    }

    init_worker_by_lua_block {
        auto_ssl:init_worker()
    }

    # HTTPS server
    server {
        listen 443 ssl;
        root /var/www/html;
        index index.html;
        server_name _;

        # Dynamic handler for issuing or returning certs for SNI domains.
        ssl_certificate_by_lua_block {
            auto_ssl:ssl_certificate()
        }

        ssl_certificate /etc/ssl/resty-auto-ssl-fallback.crt;
        ssl_certificate_key /etc/ssl/resty-auto-ssl-fallback.key;

        location / {
            proxy_pass http://localhost:3000;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
            proxy_connect_timeout       300;
            proxy_send_timeout          300;
            proxy_read_timeout          300;
            send_timeout                300;
        }
    }

    # HTTP server
    server {
        listen 80 default_server;
        listen [::]:80 default_server;
        root /var/www/html;
        index index.html;
        server_name _;

        # Handle Let's Encrypt challenges (or auto-ssl)
        location /.well-known/acme-challenge/ {
            content_by_lua_block {
                auto_ssl:challenge_server()
            }
        }

        location / {
            proxy_pass http://localhost:3000;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
            proxy_connect_timeout       300;
            proxy_send_timeout          300;
            proxy_read_timeout          300;
            send_timeout                300;
        }
    }

    # Internal server running on port 8999 for handling certificate tasks.
    server {
        listen 127.0.0.1:8999;
        client_body_buffer_size 128k;
        client_max_body_size 128k;

        location / {
            content_by_lua_block {
                auto_ssl:hook_server()
            }
        }
    }

}
EOM
sudo /etc/init.d/nginx restart
FULL_SCRIPT_DELIMITER

# Run as root and store log
sudo bash ~/setup_script.sh 2>&1 | tee ~/setup_log.log
