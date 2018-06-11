# Clone bridge server source
git clone https://github.com/OriginProtocol/bridge-server.git bridge

# Checkout bridge server develop branch
cd bridge
git checkout develop
cd ..

# Copy .env file to source
cp ./containers/bridge-container/files/config/bridge_server_dev.env ./bridge/.env

# Build bridge server image
docker build ./containers/bridge-container -t origin-bridge-image
