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
COPY ./origin-token/package*.json ./origin-token/
COPY ./origin-growth/package*.json ./origin-growth/
COPY ./experimental/origin-graphql/package*.json ./experimental/origin-graphql/
COPY ./experimental/origin-ipfs/package*.json ./experimental/origin-ipfs/
COPY ./experimental/origin-validator/package*.json ./experimental/origin-validator/
COPY ./experimental/origin-messaging-client/package*.json ./experimental/origin-messaging-client/
COPY ./experimental/origin-eventsource/package*.json ./experimental/origin-eventsource/
COPY ./experimental/origin-services/package*.json ./experimental/origin-services/

# Complete contracts source needs to be available so that `truffle compile contracts`
# which is calleed by the prepare script can succeed
COPY ./origin-contracts ./origin-contracts

# Running of postinstall script requires --unsafe-perm
RUN npm install --unsafe-perm

# Copy all the source files for the packages
COPY ./origin-dapp ./origin-dapp
COPY ./origin-discovery ./origin-discovery
COPY ./experimental/origin-graphql ./experimental/origin-graphql
COPY ./experimental/origin-ipfs ./experimental/origin-ipfs
COPY ./experimental/origin-validator ./experimental/origin-validator
COPY ./experimental/origin-eventsource ./experimental/origin-eventsource
COPY ./experimental/origin-messaging-client ./experimental/origin-messaging-client
COPY ./experimental/origin-services ./experimental/origin-services
COPY ./origin-growth ./origin-growth
COPY ./origin-ipfs-proxy ./origin-ipfs-proxy
COPY ./origin-js ./origin-js
COPY ./origin-messaging ./origin-messaging
COPY ./origin-notifications ./origin-notifications
COPY ./origin-tests ./origin-tests
COPY ./origin-token ./origin-token


# Build origin-js for event-listener
RUN npm run build --prefix origin-js
