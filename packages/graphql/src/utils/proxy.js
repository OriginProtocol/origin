import memorize from './memorize'
import contracts from '../contracts'

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

async function isContractRaw(address) {
  const code = await contracts.web3.eth.getCode(address)
  return code && code.length > 2
}
export const isContract =
  process.env.DISABLE_CACHE === 'true'
    ? isContractRaw
    : memorize(isContractRaw, address => address)

// Get the creation code for the deployed Proxy implementation
const proxyCreationCode = memorize(async () => {
  const { web3, ProxyImp, ProxyFactory } = contracts
  let code = await ProxyFactory.methods.proxyCreationCode().call()
  code += web3.eth.abi.encodeParameter('uint256', ProxyImp._address).slice(2)
  return code
})

async function predictedProxyRaw(address) {
  if (
    !contracts.config.proxyAccountsEnabled ||
    !contracts.ProxyFactory ||
    !contracts.ProxyFactory._address
  ) {
    return null
  }
  const web3 = contracts.web3
  const salt = web3.utils.soliditySha3(address, 0)
  const creationCode = await proxyCreationCode()
  const creationHash = web3.utils.sha3(creationCode)

  // Expected proxy address can be worked out thus:
  const create2hash = web3.utils
    .soliditySha3('0xff', contracts.ProxyFactory._address, salt, creationHash)
    .slice(-40)

  return web3.utils.toChecksumAddress(`0x${create2hash}`)
}

/**
 * Works out if a proxy exists for a given account or not.
 *
 * This function will calculate the address of the Proxy deployed for a given
 * account. It will return that address if code exists there or false otherwise.
 *
 * Since Proxy contracts are created using the CREATE2 call, we can calculate
 * the address the contract will be deployed to for a given account.
 */
async function hasProxyRaw(address) {
  if (
    !contracts.config.proxyAccountsEnabled ||
    !contracts.ProxyImp ||
    !contracts.ProxyImp._address
  ) {
    return false
  }
  try {
    const predicted = await predictedProxyRaw(address)

    // Return the predicted address if code exists there, or false otherwise
    const predictedIsContract = await isContract(predicted)
    return predictedIsContract ? predicted : false
  } catch (e) {
    return false
  }
}

/**
 * Returns proxy owner, or null
 */
async function proxyOwnerRaw(address) {
  if (
    !contracts.config.proxyAccountsEnabled ||
    !contracts.ProxyImp ||
    !contracts.ProxyImp._address
  ) {
    return null
  }
  try {
    const Proxy = contracts.ProxyImp.clone()
    Proxy.options.address = address
    const id = await Proxy.methods.owner().call()
    if (!id || id === ZERO_ADDRESS) return null
    return id
  } catch (e) {
    return null
  }
}

/**
 * Given an eth address, returns a structure with proxy and owner address.
 * The proxy address may be null.
 *
 * @param {string} id: owner or proxy eth address.
 * @returns {Promise<{owner: string, proxy: string||null}>}
 * @private
 */
export async function getProxyAndOwner(id) {
  // If the id has an owner, it is a proxy address.
  const owner = await proxyOwner(id)
  if (owner) {
    return { owner, proxy: id }
  }

  // If the id has a proxy, it is an owner address.
  const proxy = await hasProxy(id)
  if (proxy) {
    return { owner: id, proxy }
  }

  // id is an owner address with no proxy.
  return { owner: id, proxy: null }
}

/**
 * Given an eth address, returns a list with proxy and owner address.
 *
 * @param {string} id: owner or proxy eth address.
 * @returns {Promise<Array<string>>}
 */
export async function getAccounts(id) {
  const data = await getProxyAndOwner(id)
  return data.proxy ? [data.owner, data.proxy] : [data.owner]
}

export const proxyOwner =
  process.env.DISABLE_CACHE === 'true'
    ? proxyOwnerRaw
    : memorize(proxyOwnerRaw, address => address)
export const hasProxy =
  process.env.DISABLE_CACHE === 'true'
    ? hasProxyRaw
    : memorize(hasProxyRaw, address => address)
export const predictedProxy =
  process.env.DISABLE_CACHE === 'true'
    ? predictedProxyRaw
    : memorize(predictedProxyRaw, address => address)
export const resetProxyCache = () => {
  isContract.cache.clear()
  hasProxy.cache.clear()
  proxyOwner.cache.clear()
}
