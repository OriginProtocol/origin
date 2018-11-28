FROM node:10

WORKDIR /app

# Copy utility scripts
COPY ./development/scripts/* /usr/local/bin/

COPY ./scripts/ ./

RUN npm i -g lerna

# Copy all package files for dependency installs, this is done here to allow
# Docker to cache the npm install steps if none of the dependencies have changed
COPY ./lerna.json ./
COPY ./package*.json ./

COPY ./ipfs-proxy/package*.json ./ipfs-proxy/
COPY ./origin-contracts/package*.json ./origin-contracts/
COPY ./origin-dapp/package*.json ./origin-dapp/
COPY ./origin-discovery/package*.json ./origin-discovery/
COPY ./origin-faucet/package*.json ./origin-faucet/
COPY ./origin-js/package*.json ./origin-js/
COPY ./origin-messaging/package*.json ./origin-messaging/

# Install all dependencies
RUN lerna bootstrap --hoist --ignore-scripts -- --loglevel notice --unsafe-perm

# Copy all the source files for the packages
COPY ./ipfs-proxy ./ipfs-proxy
COPY ./origin-contracts ./origin-contracts
COPY ./origin-dapp ./origin-dapp
COPY ./origin-discovery ./origin-discovery
COPY ./origin-faucet ./origin-faucet
COPY ./origin-js ./origin-js
COPY ./origin-messaging ./origin-messaging

# Compile contracts
RUN npm run build --prefix origin-contracts

# Build origin-js for event-listener
RUN npm run build --prefix origin-js
