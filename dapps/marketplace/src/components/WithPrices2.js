import withCurrencyBalances from 'hoc/withCurrencyBalances'
import get from 'lodash/get'
import floor from 'lodash/floor'

// web3.utils.toWei only accepts up to 18 decimal places
function removeExtraDecimals(numStr) {
  return numStr.replace(/^([0-9]+\.[0-9]{18}).*/, '$1')
}

const WithPrices = ({
  targets = [],
  currencies,
  proxyCurrencies,
  price: { currency, amount } = {},
  children,
  ...props
}) => {
  proxyCurrencies = proxyCurrencies.length ? proxyCurrencies : currencies

  const isLoadingData = Object.keys(props).some(
    key => key.endsWith('Loading') && props[key]
  )

  // loading: true if wallet or anything else is loading
  if (isLoadingData)
    return children({ prices: {}, tokenStatus: { loading: true } })

  // If there is no wallet after it has loaded, return loading: false
  if (!props.wallet)
    return children({ prices: {}, tokenStatus: { loading: false } })

  if (!currency) return children({ prices: {}, tokenStatus: { loading: true } })
  const foundCurrency = currencies.find(c => c.id === currency.id)
  if (!foundCurrency || !targets) {
    return children({ prices: {}, tokenStatus: { loading: true } })
  }

  const wallet = targets.reduce((memo, target) => {
    const targetCurrency = currencies.find(c => c.id === target)
    if (!targetCurrency) return memo

    const amountUSD = amount * foundCurrency.priceInUSD
    const targetAmount = floor(amountUSD / targetCurrency.priceInUSD, 16)

    memo[target] = { amount: String(targetAmount), currency: targetCurrency }
    return memo
  }, {})

  const proxy = targets.reduce((memo, target) => {
    const targetCurrency = proxyCurrencies.find(c => c.id === target)
    if (!targetCurrency) return memo

    const amountUSD = amount * foundCurrency.priceInUSD
    const targetAmount = floor(amountUSD / targetCurrency.priceInUSD, 16)

    memo[target] = { amount: String(targetAmount), currency: targetCurrency }
    return memo
  }, {})

  const tokenStatus = targets.reduce((memo, target) => {
    memo[target] = tokenStatusFor(target, wallet, proxy)
    return memo
  }, {})

  return children({ prices: wallet, tokenStatus })
}

function tokenStatusFor(target, wallet, proxy) {
  const targetWei = removeExtraDecimals(get(wallet, `${target}.amount`) || '0')
  const targetValue = web3.utils.toBN(web3.utils.toWei(targetWei, 'ether'))

  const availableBalance = web3.utils.toBN(
    get(wallet, `${target}.currency.balance`) || '0'
  )
  const availableAllowance = web3.utils.toBN(
    get(proxy, `${target}.currency.allowance`) || '0'
  )

  const hasBalance = availableBalance.gte(targetValue)
  const neededBalance = targetValue.sub(availableBalance).toString()

  let hasAllowance = availableAllowance.gte(targetValue)
  const neededAllowance = targetValue.sub(availableAllowance).toString()

  if (target === 'token-ETH') {
    hasAllowance = true
  }

  return {
    hasBalance,
    hasAllowance,
    needsAllowance: hasAllowance ? 0 : neededAllowance,
    needsBalance: hasBalance ? 0 : neededBalance
  }
}

export default withCurrencyBalances(WithPrices)
