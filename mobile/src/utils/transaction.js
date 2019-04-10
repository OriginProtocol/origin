/**
 * Compares the currency requirements of a transaction with the balances in a wallet object
 * @param {object} a wallet object from Redux state
 * @param {object} an item from OriginWallet with action 'transaction'
 * @return {boolean} true or false
 */
export function sufficientFunds(wallet, transaction) {
  // To Do: handle currencies other than ETH
  const { eth } = wallet.balances
  const { cost, gas_cost } = transaction

  return web3.utils
    .toBN(eth)
    .gt(web3.utils.toBN(cost).add(web3.utils.toBN(gas_cost)))
}
