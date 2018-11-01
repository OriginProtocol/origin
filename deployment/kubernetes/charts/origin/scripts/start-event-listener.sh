set -e

echo "Running database migrations for discovery"

export DATABASE_URL=postgres://${DATABASE_USERNAME}:${DATABASE_PASSWORD}@${DATABASE_HOST}:${DATABASE_PORT}/${DATABASE_NAME}

# Run database migrations
node node_modules/.bin/sequelize db:migrate

echo "Starting event listener"

echo "{ \"lastLogBlock\": ${CONTINUE_BLOCK} }" > ./continue.json

# Start event listener
node listener/listener.js --elasticsearch --db --web3-url=${WEB3_URL} --ipfs-url=${IPFS_URL} --continue-file=./continue.json --trail-behind-blocks=1 --webhook=http://${NAMESPACE}-notifications.${NAMESPACE}.svc.cluster.local:3456/events
