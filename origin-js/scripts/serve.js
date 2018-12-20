const Web3 = require('web3')
const chalk = require('chalk')
const startGanache = require('./helpers/start-ganache')
const deployContracts = require('./helpers/deploy-contracts')
const startIpfs = require('./helpers/start-ipfs')
const args = process.argv.slice(2)
const noGanache = args.length && args[0] === 'no-ganache'
const Origin = require('../src/index').default
const start = async () => {
  if (!noGanache) {
    console.log(chalk`\n{bold.hex('#1a82ff') ⬢  Starting Local Blockchain }\n`)
    await startGanache()
  }
  console.log(chalk`\n{bold.hex('#26d198') ⬢  Deploying Smart Contracts }\n`)
  await deployContracts()
  console.log(chalk`\n{bold.hex('#6e3bea') ⬢  Starting Local IPFS }\n`)
  await startIpfs()
}


class StoreMock {
  constructor() {
    this.storage = {}
  }

  get(key) {
    return this.storage[key]
  }

  set(key, value) {
    this.storage[key] = value
  }
}

const createSamples = async() => {
  const provider = new Web3.providers.HttpProvider('http://localhost:8545')
  const web3 = new Web3(provider)
  const accounts = await web3.eth.getAccounts()
  
  const origin  = new Origin({
    ipfsDomain: 'ipfs-proxy',
    ipfsGatewayProtocol: 'http',
    ipfsGatewayPort: 9999,
    ipfsApiPort: 9999,
    discoveryServerUrl: 'http://origin-discovery:4000/graphql',
    web3: web3,
    perfModeEnabled: true,
    // Note: make sure to use same affiliate and arbitrator as event-listener
    // otherwise event-listener's data consistency checks will fail and
    // data does not get indexed.
    // See origin/development/envfiles/event-listener.env for values to use.
    affiliate: '0x821aea9a577a9b44299b9c15c88cf3087f3b5544',
    arbitrator: '0x0d1d4e623d10f9fba5db95830f7d3839406c6af2',
  })

  const hawaii_house = require('../test/fixtures/hawaii-house.json')
  const hawaii_data = Object.assign({}, hawaii_house)
  await origin.marketplace.createListing(hawaii_data)

  const lake_house = require('../test/fixtures/lake-house.json')
  const lake_data = Object.assign({}, lake_house)
  await origin.marketplace.createListing(lake_data)

  const scout = require('../test/fixtures/scout.json')
  const scout_data = Object.assign({}, scout)
  await origin.marketplace.createListing(scout_data)
  
  const taylor = require('../test/fixtures/taylor-swift-tix.json')
  const taylor_data = Obejct.assign({}, taylor)
  await origin.marketplace.createListing({}, taylor_data)

  const zinc = require('../test/fixtures/zinc-house.json')
  const zinc_data = Object.assign({}, zinc)
  await origin.marketplace.createListing(zinc_data)

}

start()
createSamples()
