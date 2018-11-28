FROM node:10

WORKDIR /app

# Copy utility scripts
COPY ./development/scripts/* /usr/local/bin/

COPY ./scripts/ ./

RUN npm i -g lerna

# Copy all package files for dependency installs, this is done here to allow
# Docker to cache the npm install steps if none of the dependencies have changed
COPY ./ipfs-proxy/package*.json ./ipfs-proxy/
COPY ./origin-contracts/package*.json ./origin-contracts/
COPY ./origin-dapp/package*.json ./origin-dapp/
COPY ./origin-discovery/package*.json ./origin-discovery/
COPY ./origin-faucet/package*.json ./origin-faucet/
COPY ./origin-js/package*.json ./origin-js/
COPY ./origin-messaging/package*.json ./origin-messaging/
COPY ./origin-token-transfer/client/package*.json ./origin-token-transfer/client/
COPY ./origin-token-transfer/server/package*.json ./origin-token-transfer/server/
COPY ./package*.json ./
COPY ./lerna.json ./

# Install all dependencies
RUN lerna bootstrap \
	--ci \
	--hoist \
	--scope ipfs-proxy \
	--scope origin-contracts \
	--scope origin-dapp \
	--scope origin-discovery \
	--scope origin-faucet \
	--scope origin \
	--scope origin-messaging \
	--scope origin-token-transfer-client \
	--scope origin-token-transfer-server \
	--ignore-scripts \
	-- \
	--loglevel notice \
	--unsafe-perm

# Copy all the source files
COPY ./ ./

# Compile contracts
RUN npm run build --prefix origin-contracts

# Build origin-js for event-listener
RUN npm run build --prefix origin-js
