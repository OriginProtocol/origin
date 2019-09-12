const chalk = require('chalk')
const Web3 = require('web3')

const providerURL =
  'https://mainnet.infura.io/v3/98df57f0748e455e871c48b96f2095b2'
const web3 = new Web3(providerURL)

const ProxyFactoryContract = require('@origin/contracts/build/contracts/ProxyFactory_solc')
const IdentityProxyContract = require('@origin/contracts/build/contracts/IdentityProxy_solc')
const MarketplaceContract = require('@origin/contracts/build/contracts/V00_Marketplace')
const IdentityEventsContract = require('@origin/contracts/build/contracts/IdentityEvents')

const ProxyFactory = new web3.eth.Contract(ProxyFactoryContract.abi)
const Marketplace = new web3.eth.Contract(MarketplaceContract.abi)
const IdentityEvents = new web3.eth.Contract(IdentityEventsContract.abi)
const IdentityProxy = new web3.eth.Contract(IdentityProxyContract.abi)

const Contracts = [ProxyFactory, Marketplace, IdentityEvents, IdentityProxy]

const Lookups = {}
for (const contract of Contracts) {
  contract._jsonInterface
    .filter(i => i.signature)
    .forEach(i => {
      Lookups[i.signature] = i
    })
}

async function printTransaction(txHash) {
  const tx = await web3.eth.getTransaction(txHash)
  console.log(tx)
  try {
    const receipt = await web3.eth.getTransactionReceipt(txHash)
    console.log(receipt)
  } catch (e) {
    console.error('Could not get receipt')
    console.error(e)
  }

  const input = decodeAbi(tx.input)

  console.log('============')
  console.log(chalk.bold(txHash))

  console.log('--> 1. ' + chalk.bold(input.method.name))
  console.log(cleanerParams(input.parameters))
  if (input.parameters.data) {
    const forwarded = decodeAbi(input.parameters.data)
    console.log('--> 2. ' + chalk.bold(forwarded.method.name))
    console.log(cleanerParams(forwarded.parameters))
  }
  if (input.parameters._offer) {
    const forwarded = decodeAbi(input.parameters._offer)
    console.log('--> 2. ' + chalk.bold(forwarded.method.name))
    console.log(cleanerParams(forwarded.parameters))
  }
  if (input.parameters.initializer) {
    const initializer = decodeAbi(input.parameters.initializer)
    console.log('--> 2. ' + chalk.bold(initializer.method.name))
    console.log(cleanerParams(initializer.parameters))
    if (initializer.parameters._data) {
      const actualAction = decodeAbi(initializer.parameters._data)
      console.log('--> 3. ' + chalk.bold(actualAction.method.name))
      console.log(cleanerParams(actualAction.parameters))
    }
  }
}

function decodeAbi(hex) {
  const methodHex = hex.substr(0, 10)
  const paramsHex = '0x' + hex.substr(10)
  const method = Lookups[methodHex]
  const parameters = web3.eth.abi.decodeParameters(method.inputs, paramsHex)
  return { methodHex, method, paramsHex, parameters }
}

function cleanerParams(params) {
  const out = {}
  for (const k in params) {
    if (k.match(/^[0-9]+$/)) {
      continue
    }
    if (k == '__length__') {
      continue
    }
    out[k] = params[k]
  }
  return out
}

if (!process.argv[2]) {
  console.log(
    'Usage:\n\nnode debug-cli.js 0x71e18dd6da94548de5b21c22a852b5bc7501e0e6a1169dbc930333ff59018f6c\n\n'
  )
} else {
  printTransaction(process.argv[2])
}
