export const Currencies = [
  ['fiat-USD', 'USD', '$'],
  ['fiat-GBP', 'GBP', '£'],
  ['fiat-EUR', 'EUR', '€'],
  ['fiat-KRW', 'KRW', '₩'],
  ['fiat-JPY', 'JPY', '¥'],
  ['fiat-CNY', 'CNY', '¥']
]

export const CurrenciesByKey = Currencies.reduce((m, o) => {
  m[o[0]] = o
  return m
}, {})
