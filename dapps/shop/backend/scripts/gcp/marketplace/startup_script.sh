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
