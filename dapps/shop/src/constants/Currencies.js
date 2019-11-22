// NOTE: We should consider merging all currency information, as there is
// duplicate data in graphql/utils/currencies.js and mobile/src/constants.js

export const Currencies = [
  ['fiat-USD', 'USD', '$'],
  ['fiat-GBP', 'GBP', '£'],
  ['fiat-EUR', 'EUR', '€'],
  ['fiat-KRW', 'KRW', '₩'],
  ['fiat-JPY', 'JPY', '¥'],
  ['fiat-CNY', 'CNY', '¥'],
  ['fiat-SGD', 'SGD', 'S$']
]

// Eg CurrenciesByKey['fiat-EUR'] = ['fiat-EUR', 'EUR', '€']
export const CurrenciesByKey = Currencies.reduce((m, o) => {
  m[o[0]] = o
  return m
}, {})

// Eg CurrenciesByKey['USD'] = ['fiat-USD', 'USD', '$']
export const CurrenciesByCode = Currencies.reduce((m, o) => {
  m[o[1]] = o
  return m
}, {})

export const CurrenciesByCountryCode = {
  FR: CurrenciesByCode['EUR'],
  DE: CurrenciesByCode['EUR'],
  IE: CurrenciesByCode['EUR'],
  IT: CurrenciesByCode['EUR'],
  ES: CurrenciesByCode['EUR'],
  NL: CurrenciesByCode['EUR'],
  US: CurrenciesByCode['USD'],
  GB: CurrenciesByCode['GBP'],
  KR: CurrenciesByCode['KRW'],
  JP: CurrenciesByCode['JPY'],
  CN: CurrenciesByCode['CNY'],
  SG: CurrenciesByCode['SGD']
}
