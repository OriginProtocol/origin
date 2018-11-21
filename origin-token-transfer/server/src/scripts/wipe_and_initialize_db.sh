#! /bin/bash -xe
SEQUELIZE="npx sequelize --config ../../config/config.json"

mkdir -p ../data/
rm -f ../data/token-grants.sqlite3
${SEQUELIZE} db:migrate
${SEQUELIZE} db:seed:all
node vest_grants.js
