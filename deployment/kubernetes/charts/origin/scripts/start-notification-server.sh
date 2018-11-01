set -e

echo "Running database migrations for notification server"

export DATABASE_URL=postgres://${DATABASE_USERNAME}:${DATABASE_PASSWORD}@${DATABASE_HOST}:${DATABASE_PORT}/${DATABASE_NAME}

# Run database migrations
node node_modules/.bin/sequelize db:migrate

echo "Starting notification server"

node app.js
