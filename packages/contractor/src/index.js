const args = require('commander')
const repl = require('repl')
const Web3 = require('web3')

const ProxyFactoryContract = require('@origin/contracts/build/contracts/ProxyFactory_solc')
const MarketplaceContract = require('@origin/contracts/build/contracts/V00_Marketplace')
const IdentityEventsContract = require('@origin/contracts/build/contracts/IdentityEvents')

const DefaultProviders = {
  1: 'https://mainnet.infura.io/v3/98df57f0748e455e871c48b96f2095b2',
  4: 'https://eth-rinkeby.alchemyapi.io/jsonrpc/D0SsolVDcXCw6K6j2LWqcpW49QIukUkI',
  999: 'http://localhost:8545',
  2222: 'https://testnet.originprotocol.com/rpc'
}

const ContractAddresses = {
  1: '@origin/contracts/build/contracts_mainnet.json',
  4: '@origin/contracts/build/contracts_rinkeby.json',
  999: '@origin/contracts/build/contracts.json',
  2222: '@origin/contracts/build/contracts_origin.json'
}

args.option(
  '-n, --network <ID>',
  'Ethereum network number to connect to (Default: 4)'
)
args.parse(process.argv)

const initContracts = (web3, networkID) => {
  const addresses = require(ContractAddresses[networkID])
  return {
    ProxyFactory: new web3.eth.Contract(
      ProxyFactoryContract.abi,
      addresses.ProxyFactory
    ),
    IdentityEvents: new web3.eth.Contract(
      IdentityEventsContract.abi,
      addresses.IdentityEvents
    ),
    Marketplace: new web3.eth.Contract(
      MarketplaceContract.abi,
      addresses.Marketplace
    )
  }
}

const initContext = () => {
  return {
    version: '0.1.0'
  }
}

const printBanner = (network, contractNames, globals) => {
  console.log(`Connected to network: ${network}`)
  console.log(`Initialized contracts: ${contractNames.join(', ')}`)
  console.log(`Available globals: ${globals.join(', ')}`)
}

const buildConsole = () => {
  const netID = args.network ? Number(args.network) : 4
  const web3 = new Web3(DefaultProviders[netID])
  const contracts = initContracts(web3, netID)
  const context = initContext()
  context.web3 = web3

  printBanner(netID, Object.keys(contracts), Object.keys(context))

  const shell = repl.start('> ')
  // Available contracts to the RELP
  for (const key of Object.keys(contracts)) {
    shell.context[key] = contracts[key]
  }
  // Available globals to the RELP
  for (const key of Object.keys(context)) {
    shell.context[key] = context[key]
  }

  return shell
}

if (require.main === module) {
  buildConsole()
}
