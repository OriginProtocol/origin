import contracts from '../contracts'

import memoize from 'lodash/memoize'

/**
 * Returns proxy owner, or null
 */
async function proxyOwner(address) {
  if (!contracts.config.proxyAccountsEnabled) {
    return null
  }
  try {
    const Proxy = contracts.ProxyImp.clone()
    Proxy.options.address = address
    try {
      const id = await Proxy.methods.owner().call()
      return id || null
    } catch (e) {
      return null
    }
  } catch (e) {
    return null
  }
}

export default memoize(proxyOwner, address => address)
