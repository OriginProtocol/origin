FROM node:10

WORKDIR /app

# Copy wait-for.sh for waiting for required services to start
COPY ./scripts/wait-for.sh /usr/local/bin/

# Copy all package files for dependency installs, this is done here to allow
# Docker to cache the npm install steps if none of the dependencies have changed
COPY ./lerna.json ./
COPY ./package.json ./
COPY ./packages/origin-js/package.json ./packages/origin-js/
COPY ./packages/graphql/package.json ./packages/graphql/
COPY ./packages/ipfs/package.json ./packages/ipfs/
COPY ./packages/validator/package.json ./packages/validator/
COPY ./packages/messaging-client/package.json ./packages/messaging-client/
COPY ./packages/linker-client/package.json ./packages/linker-client/
COPY ./packages/eventsource/package.json ./packages/eventsource/
COPY ./packages/services/package.json ./packages/services/
COPY ./packages/token/package.json ./packages/token/
COPY ./infra/discovery/package.json ./infra/discovery/
COPY ./infra/messaging/package.json ./infra/messaging/
COPY ./infra/ipfs-proxy/package.json ./infra/ipfs-proxy/
COPY ./infra/notifications/package.json ./infra/notifications/
COPY ./infra/tests/package.json ./infra/tests/
COPY ./infra/growth/package.json ./infra/growth/
COPY ./infra/identity/package.json ./infra/identity/
COPY ./infra/bridge/package.json ./infra/bridge/
COPY ./infra/linking/package.json ./infra/linking/
COPY ./scripts/ ./scripts/

# Complete contracts source needs to be available so that `truffle compile contracts`
# which is calleed by the prepare script can succeed
COPY ./packages/contracts ./packages/contracts
COPY ./packages/origin-js ./packages/origin-js

# Running of postinstall script requires --unsafe-perm
RUN npm install --unsafe-perm

# Build js for event-listener
RUN npm run build --prefix packages/origin-js
