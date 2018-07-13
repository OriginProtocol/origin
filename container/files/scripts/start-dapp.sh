cd /opt/origin-dapp/source

# Cant do install until origin-js is available due to linking
wait-for.sh -t 0 -q localhost:5000 -- echo 'origin-bridge is available, starting origin-dapp...' && npm run install:dev && npm start
