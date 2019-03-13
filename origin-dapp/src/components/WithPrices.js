import withCurrencyBalances from 'hoc/withCurrencyBalances'
import withWallet from 'hoc/withWallet'
import round from 'lodash/round'

const WithPrices = ({
  targets = [],
  currencies,
  price: { currency, amount } = {},
  children
}) => {
  if (!currency) return null
  const foundCurrency = currencies.find(c => c.id === currency.id)
  if (!foundCurrency || !targets) {
    return children()
  }

  const results = targets.reduce((memo, target) => {
    const targetCurrency = currencies.find(c => c.id === target)
    if (!targetCurrency) return memo

    const amountUSD = amount * foundCurrency.priceInUSD
    const targetAmount = round(amountUSD / targetCurrency.priceInUSD, 5)

    memo[target] = { amount: String(targetAmount), currency: targetCurrency }
    return memo
  }, {})

  return children(results)
}

export default withWallet(withCurrencyBalances(WithPrices))
