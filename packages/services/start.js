const start = require('./index.js')

async function go() {
  const stop = await start({
    ganache: true,
    deployContracts: true,
    ipfs: process.env.START_IPFS !== undefined ? process.env.START_IPFS : true,
    populate: true
  })
  stop()
}

if (process.env.POPULATE) {
  go()
} else {
  start({
    ganache:
      process.env.START_GANACHE !== undefined
        ? process.env.START_GANACHE
        : true,
    deployContracts:
      process.env.DEPLOY_CONTRACTS !== undefined
        ? process.env.DEPLOY_CONTRACTS
        : false,
    ipfs: process.env.START_IPFS !== undefined ? process.env.START_IPFS : true,
    populate:
      process.env.POPULATE_IPFS !== undefined ? process.env.POPULATE_IPFS : true
  })
}
