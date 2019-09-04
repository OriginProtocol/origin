import memoize from 'lodash/memoize'

const getNodeInfo = memoize(async web3 => await web3.eth.getNodeInfo())
const getAccounts = memoize(async web3 => await web3.eth.getAccounts())

/**
 * Trigger the EVM to mine a block
 * @param web3 {Web3} a Web3 instance
 */
const mineBlock = async web3 => {
  const nodeInfo = await getNodeInfo(web3)

  if (nodeInfo.match(/TestRPC/i)) {
    const hasAsync = typeof web3.currentProvider.sendAsync !== 'undefined'
    const sendMethod = hasAsync ? 'sendAsync' : 'send'
    return web3.currentProvider[sendMethod]({ method: 'evm_mine' }, () => {})
  }

  const accounts = await getAccounts(web3)
  const from = accounts ? accounts[0] : null
  if (from) {
    web3.eth.sendTransaction({ from, to: from, value: 0, gas: 50000 })
  }
}

export default mineBlock
