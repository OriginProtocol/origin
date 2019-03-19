import withCurrencyBalances from 'hoc/withCurrencyBalances'
import withWallet from 'hoc/withWallet'
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

  if (!currency) return children({ prices: [], tokenStatus: {} })
  const foundCurrency = currencies.find(c => c.id === currency.id)
  if (!foundCurrency || !targets) {
    return children({ prices: [], tokenStatus: {} })
  }

  const results = targets.reduce((memo, target) => {
    const targetCurrency = currencies.find(c => c.id === target)
    if (!targetCurrency) return memo

    const amountUSD = amount * foundCurrency.priceInUSD
    const targetAmount = amountUSD / targetCurrency.priceInUSD

    memo[target] = { amount: String(targetAmount), currency: targetCurrency }
    return memo
  }, {})

  if (target === 'token-ETH') {
    hasBalance = true
    hasAllowance = true
  } else if (target) {
    const targetBalance = get(results, `${target}.currency.balance`) || '0'
    const targetAllowance = get(results, `${target}.currency.allowance`) || '0'
    const amountBN = web3.utils.toBN(web3.utils.toWei(amount, 'ether'))

    const availableBalance = web3.utils.toBN(targetBalance)
    hasBalance = availableBalance.gte(amountBN)
    needsBalance = hasBalance ? 0 : amountBN.sub(availableBalance).toString()

    const availableAllowance = web3.utils.toBN(targetAllowance)
    hasAllowance = availableAllowance.gte(amountBN)
    needsAllowance = hasAllowance
      ? 0
      : amountBN.sub(availableAllowance).toString()
  }

  const tokenStatus = {
    hasBalance,
    hasAllowance,
    needsAllowance,
    needsBalance
  }

  return children({ prices: results, tokenStatus })
}

export default withWallet(withCurrencyBalances(WithPrices))
