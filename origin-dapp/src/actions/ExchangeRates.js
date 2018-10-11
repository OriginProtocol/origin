import keyMirror from 'utils/keyMirror'

export const ExchangeRateConstants = keyMirror(
  {
    SET_EXCHANGE_RATE: null
  },
  'EXCHANGE_RATES'
)

export function setExchangeRate(fiatAbbrev, cryptoAbbrev, rate) {
  const currencyPair = `${fiatAbbrev.toUpperCase()}/${cryptoAbbrev.toUpperCase()}`
  return {
    type: ExchangeRateConstants.SET_EXCHANGE_RATE,
    currencyPair,
    rate,
    timestamp: new Date()
  }
}
