FROM node:10

WORKDIR /app

# Copy wait-for.sh for waiting for required services to start
COPY ./scripts/wait-for.sh /usr/local/bin/

# Copy all package files for dependency installs, this is done here to allow
# Docker to cache the npm install steps if none of the dependencies have changed
COPY ./lerna.json ./
COPY ./package.json ./
COPY ./origin-discovery/package.json ./origin-discovery/
COPY ./origin-ipfs-proxy/package.json ./origin-ipfs-proxy/
COPY ./origin-js/package.json ./origin-js/
COPY ./origin-messaging/package.json ./origin-messaging/
COPY ./origin-notifications/package.json ./origin-notifications/
COPY ./origin-tests/package.json ./origin-tests/
COPY ./origin-growth/package.json ./origin-growth/
COPY ./origin-identity/package.json ./origin-identity/
COPY ./origin-token/package.json ./origin-token/
COPY ./origin-bridge/package.json ./origin-bridge/
COPY ./origin-dapp/package.json ./origin-dapp/
COPY ./origin-graphql/package.json ./origin-graphql/
COPY ./origin-ipfs/package.json ./origin-ipfs/
COPY ./origin-validator/package.json ./origin-validator/
COPY ./origin-messaging-client/package.json ./origin-messaging-client/
COPY ./origin-linker-client/package.json ./origin-linker-client/
COPY ./origin-eventsource/package.json ./origin-eventsource/
COPY ./origin-services/package.json ./origin-services/
COPY ./scripts/ ./scripts/

# Complete contracts source needs to be available so that `truffle compile contracts`
# which is calleed by the prepare script can succeed
COPY ./origin-contracts ./origin-contracts
COPY ./origin-js ./origin-js

# Running of postinstall script requires --unsafe-perm
RUN npm install --unsafe-perm

# Build origin-js for event-listener
RUN npm run build --prefix origin-js
