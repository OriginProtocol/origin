import txHelper, { checkMetaMask } from '../_txHelper'
import IdentityProxy from '@origin/contracts/build/contracts/IdentityProxy_solc'
import contracts from '../../contracts'
import cost from '../_gasCost'
import { hasProxy, proxyOwner } from '../../utils/proxy'
import currencies from '../../utils/currencies'

async function withdrawDust(_, data) {
  const from = data.from || contracts.defaultMobileAccount
  await checkMetaMask(from)

  let gas = cost.withdrawDust

  const proxy = (await hasProxy(from)) || from
  const owner = await proxyOwner(proxy)

  if (!proxy) {
    console.error('withdrawDust: Cannot find proxy account', proxy)
    throw new Error('Cannot find proxy account')
  }

  const Proxy = new contracts.web3Exec.eth.Contract(IdentityProxy.abi, proxy)

  const currency = await currencies.get(data.currency)

  const weiValue = contracts.web3.utils.toWei(data.amount, 'ether')

  let currencyAddress = currency.address
  if (!currencyAddress) {
    const contractToken = contracts.tokens.find(t => t.symbol === currency.code)
    if (contractToken) {
      currencyAddress = contractToken.id
    }
  }

  let tx = Proxy.methods.transferToOwner(currencyAddress, weiValue)

  if (currency.code !== 'ETH') {
    // For ERC20
    const txData = await tx.encodeABI()

    tx = Proxy.methods.marketplaceExecute(
      owner,
      proxy,
      txData,
      currencyAddress,
      weiValue
    )

    gas = gas + 100000
  }

  return txHelper({
    tx,
    from: owner,
    mutation: 'withdrawDust',
    gas
  })
}

export default withdrawDust
