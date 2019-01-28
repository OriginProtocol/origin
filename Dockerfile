FROM node:10

WORKDIR /app

# Copy utility scripts
COPY ./development/scripts/* /usr/local/bin/

COPY ./scripts/ ./scripts/

# Copy all package files for dependency installs, this is done here to allow
# Docker to cache the npm install steps if none of the dependencies have changed
COPY ./lerna.json ./
COPY ./package*.json ./
COPY ./origin-dapp/package*.json ./origin-dapp/
COPY ./origin-discovery/package*.json ./origin-discovery/
COPY ./origin-ipfs-proxy/package*.json ./origin-ipfs-proxy/
COPY ./origin-js/package*.json ./origin-js/
COPY ./origin-messaging/package*.json ./origin-messaging/
COPY ./origin-notifications/package*.json ./origin-notifications/
COPY ./origin-tests/package*.json ./origin-tests/
COPY ./origin-growth/package*.json ./origin-growth/
COPY ./experimental/origin-graphql/package*.json ./experimental/origin-graphql

# Complete contracts source needs to be available so that `truffle compile contracts`
# which is calleed by the prepare script can succeed
COPY ./origin-contracts ./origin-contracts

# Running of postinstall script requires --unsafe-perm
RUN npm install --unsafe-perm

# Copy all the source files for the packages
COPY ./origin-dapp ./origin-dapp
COPY ./origin-discovery ./origin-discovery
COPY ./experimental/origin-graphql ./experimental/origin-graphql
COPY ./origin-growth ./origin-growth
COPY ./origin-ipfs-proxy ./origin-ipfs-proxy
COPY ./origin-js ./origin-js
COPY ./origin-messaging ./origin-messaging
COPY ./origin-notifications ./origin-notifications
COPY ./origin-tests ./origin-tests

# Build origin-js for event-listener
RUN npm run build --prefix origin-js
