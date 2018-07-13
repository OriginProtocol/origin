# Clone bridge server source
git clone https://github.com/OriginProtocol/origin-bridge.git

# Checkout bridge server develop branch
cd origin-bridge
git checkout develop
cd ..

# Clone js source
git clone https://github.com/OriginProtocol/origin-js.git

# Checkout js develop branch
cd origin-js
git checkout develop
cd ..

# Clone dapp source
git clone https://github.com/OriginProtocol/origin-dapp.git

# Checkout dapp develop branch
cd origin-dapp
git checkout develop
cd ..

# Copy .env files to source
cp ./container/files/config/bridge_dev.env ./bridge/.env
cp ./container/files/config/dapp_dev.env ./dapp/.env

# Build bridge server image
docker build ./container -t origin-image
