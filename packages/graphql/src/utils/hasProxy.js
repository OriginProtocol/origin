import contracts from '../contracts'

export default async function hasProxy(address) {
  if (!process.env.ENABLE_PROXY_ACCOUNTS) {
    return false
  }
  try {
    const web3 = contracts.web3Exec

    const changeOwner = await contracts.ProxyImp.methods
      .changeOwner(address)
      .encodeABI()

    const salt = web3.utils.soliditySha3(web3.utils.sha3(changeOwner), 0)

    let creationCode = await contracts.ProxyFactory.methods
      .proxyCreationCode()
      .call()

    creationCode += web3.eth.abi
      .encodeParameter('uint256', contracts.ProxyImp._address)
      .slice(2)

    const creationHash = web3.utils.sha3(creationCode)

    const create2hash = web3.utils
      .soliditySha3('0xff', contracts.ProxyFactory._address, salt, creationHash)
      .slice(-40)
    const predicted = `0x${create2hash}`

    const code = await web3.eth.getCode(predicted)
    return code.slice(2).length > 0
      ? web3.utils.toChecksumAddress(predicted)
      : false
  } catch (e) {
    return false
  }
}
