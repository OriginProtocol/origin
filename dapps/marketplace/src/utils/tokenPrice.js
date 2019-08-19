export default function tokenPrice(amount, decimals = 18, places = 0) {
  if (!amount) return '0'
  try {
    const supplyBN = web3.utils.toBN(amount)
    const decimalsBN = web3.utils.toBN(
      web3.utils.padRight('1', decimals + 1 - places)
    )
    const str = supplyBN.div(decimalsBN).toString()
    if (places > 0) {
      return String(Number(str) / Math.pow(10, places))
    }
    return str
  } catch (e) {
    return `${amount}`
  }
}
