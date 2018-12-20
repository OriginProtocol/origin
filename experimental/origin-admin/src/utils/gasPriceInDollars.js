export default function({ gasPriceGwei = 5.5, pricePerEth = 250 }) {
  return function(gas) {
    const pricePerGwei = pricePerEth / 1000000000,
      priceInUsd = gas * gasPriceGwei * pricePerGwei
    return priceInUsd
      ? '$' + (Math.round(priceInUsd * 100) / 100).toFixed(2)
      : ''
  }
}
