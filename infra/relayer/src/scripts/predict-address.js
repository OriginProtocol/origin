const Web3 = require('web3')
const ProxyFactoryContract = require('@origin/contracts/build/contracts/ProxyFactory_solc')
const IdentityProxyContract = require('@origin/contracts/build/contracts/IdentityProxy_solc')
const addresses = require('@origin/contracts/build/contracts_mainnet.json')

const proxyCreationCode = async (web3, ProxyFactory, ProxyImp) => {
  let code = await ProxyFactory.methods.proxyCreationCode().call()
  code += web3.eth.abi.encodeParameter('uint256', ProxyImp._address).slice(2)
  return code
}

async function predictedProxy(web3, ProxyFactory, ProxyImp, address) {
  const salt = web3.utils.soliditySha3(address, 0)
  const creationCode = await proxyCreationCode(web3, ProxyFactory, ProxyImp)
  const creationHash = web3.utils.sha3(creationCode)

  // Expected proxy address can be worked out thus:
  const create2hash = web3.utils
    .soliditySha3('0xff', ProxyFactory._address, salt, creationHash)
    .slice(-40)

  return web3.utils.toChecksumAddress(`0x${create2hash}`)
}

if (require.main === module && process.stdin.isTTY) {
  const [address] = process.argv.slice(2)
  console.log('from: ', address)

  const web3 = new Web3(
    'https://eth-mainnet.alchemyapi.io/jsonrpc/FCA-3myPH5VFN8naOWyxDU6VkxelafK6'
  )

  const ProxyFactory = new web3.eth.Contract(
    ProxyFactoryContract.abi,
    addresses.ProxyFactory
  )

  const IdentityProxy = new web3.eth.Contract(
    IdentityProxyContract.abi,
    addresses.IdentityProxyImplementation
  )

  predictedProxy(web3, ProxyFactory, IdentityProxy, address).then(
    proxyAddress => {
      console.log('proxyAddress: ', proxyAddress)
    }
  )
}
