# Clone bridge server source
git clone https://github.com/OriginProtocol/bridge-server.git bridge

# Checkout bridge server develop branch
cd bridge
git checkout develop
cd ..

# Clone js source
git clone https://github.com/OriginProtocol/origin-js.git js

# Checkout js develop branch
cd js
git checkout develop
cd ..

# Copy .env file to source
cp ./container/files/config/bridge_server_dev.env ./bridge/.env

# Build bridge server image
docker build ./container -t origin-image
