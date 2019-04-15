const program = require('commander')
const start = require('./index.js')

program
  .option('-g, --ganache', 'Start Ganache')
  .option('-i, --ipfs', 'Start IPFS')
  .option('-p, --populate-ipfs', 'Populate IPFS')
  .option('-f, --fixtures', 'Deploy contracts and push IPFS fixtures')
  .option('-s, --setup', 'Write contracts, populate IPFS fixtures, then exit')
  .option('-t, --truffle', 'Write contract addresses to Truffle json')
  .parse(process.argv)

async function setup() {
  const stop = await start({
    ganache: true,
    deployContracts: true,
    ipfs: true,
    populate: true,
    writeTruffle: true
  })
  stop()
}

if (!process.argv.slice(2).length) {
  program.outputHelp()
  process.exit(1)
} else if (program.setup) {
  setup()
} else {
  start({
    ganache: program.ganache,
    deployContracts: program.fixtures,
    ipfs: program.ipfs,
    populate: program.populateIpfs,
    writeTruffle: program.truffle
  })
}
