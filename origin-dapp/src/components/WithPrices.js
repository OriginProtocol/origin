import withCurrencyBalances from 'hoc/withCurrencyBalances'
import withWallet from 'hoc/withWallet'
import round from 'lodash/round'
import get from 'lodash/get'

const WithPrices = ({
  target,
  targets = [],
  currencies,
  price: { currency, amount } = {},
  children
}) => {
  let hasBalance = false,
    hasAllowance = false,
    needsAllowance,
    needsBalance

  if (!currency) return null
  const foundCurrency = currencies.find(c => c.id === currency.id)
  if (!foundCurrency || !targets) {
    return children({})
  }

  const results = targets.reduce((memo, target) => {
    const targetCurrency = currencies.find(c => c.id === target)
    if (!targetCurrency) return memo

    const amountUSD = amount * foundCurrency.priceInUSD
    const targetAmount = round(amountUSD / targetCurrency.priceInUSD, 5)

    memo[target] = { amount: String(targetAmount), currency: targetCurrency }
    return memo
  }, {})

  if (target) {
    const targetBalance = get(results, `${target}.currency.balance`, '0')
    const targetAllowance = get(results, `${target}.currency.allowance`, '0')

    const availableBalance = Number(web3.utils.fromWei(targetBalance, 'ether'))
    hasBalance = availableBalance >= Number(amount)
    needsBalance = hasBalance ? 0 : Number(amount) - availableBalance

    const availableAllowance = Number(
      web3.utils.fromWei(targetAllowance, 'ether')
    )
    hasAllowance = availableAllowance >= Number(amount)
    needsAllowance = hasAllowance ? 0 : Number(amount) - availableAllowance
  }

  return children({
    prices: results,
    tokenStatus: {
      hasBalance,
      hasAllowance,
      needsAllowance,
      needsBalance
    }
  })
}

export default withWallet(withCurrencyBalances(WithPrices))
