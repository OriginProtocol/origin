import contracts from '../contracts'

import memoize from 'lodash/memoize'

/**
 * Works out if a proxy exists for a given account or not.
 *
 * This function will calculate the address of the Proxy deployed for a given
 * account. It will return that address if code exists there or false otherwise.
 *
 * Since Proxy contracts are created using the CREATE2 call, we can calculate
 * the address the contract will be deployed to for a given account.
 */

async function hasProxy(address) {
  if (!contracts.config.proxyAccountsEnabled) {
    return false
  }
  try {
    const web3 = contracts.web3Exec

    // Calculate the call data used when deploying the contract
    const changeOwner = await contracts.ProxyImp.methods
      .changeOwner(address)
      .encodeABI()

    // Salt is based on the call data from above
    const salt = web3.utils.soliditySha3(web3.utils.sha3(changeOwner), 0)

    // Get the creation code for the deployed Proxy implementation
    let creationCode = await contracts.ProxyFactory.methods
      .proxyCreationCode()
      .call()

    creationCode += web3.eth.abi
      .encodeParameter('uint256', contracts.ProxyImp._address)
      .slice(2)

    const creationHash = web3.utils.sha3(creationCode)

    // Expected proxy address can be worked out thus:
    const create2hash = web3.utils
      .soliditySha3('0xff', contracts.ProxyFactory._address, salt, creationHash)
      .slice(-40)
    const predicted = `0x${create2hash}`

    // Return the predicted address if code exists there, or false otherwise
    const code = await web3.eth.getCode(predicted)
    return code.slice(2).length > 0
      ? web3.utils.toChecksumAddress(predicted)
      : false
  } catch (e) {
    return false
  }
}

// export default hasProxy
export default memoize(hasProxy, address => address)
