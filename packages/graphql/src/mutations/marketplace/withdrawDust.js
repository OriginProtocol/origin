import txHelper, { checkMetaMask } from '../_txHelper'
import IdentityProxy from '@origin/contracts/build/contracts/IdentityProxy_solc'
import contracts from '../../contracts'
import cost from '../_gasCost'
import { hasProxy } from '../../utils/proxy'
import currencies from '../../utils/currencies';

async function withdrawDust(_, data) {
  const from = data.from || contracts.defaultMobileAccount
  await checkMetaMask(from)

  const gas = cost.withdrawDust

  const proxy = (await hasProxy(from)) || from

  if (!proxy) {
    console.error('withdrawDust: Cannot find proxy account', proxy)
    throw new Error('Cannot find proxy account')
  }

  const Proxy = new contracts.web3Exec.eth.Contract(IdentityProxy.abi, proxy)

  const currency = await currencies.get(data.currency)

  const tx = Proxy.methods.transferToOwner(
    currency.address,
    contracts.web3.utils.toWei(data.amount, 'ether')
  )

  return txHelper({
    tx,
    from,
    mutation: 'withdrawDust',
    gas
  })
}

export default withdrawDust
