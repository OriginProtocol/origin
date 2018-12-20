export default function currency(obj) {
  if (!obj) return null
  let { amount, currency } = obj
  const { converted } = obj
  if (currency === 'OGN' && !converted) {
    amount = web3.utils.fromWei(amount, 'ether')
  }
  if (currency.indexOf('0x00000') === 0) {
    currency = 'ETH'
  }
  return `${amount} ${currency}`
}
