export default {
  'fiat-USD': {
    id: 'fiat-USD',
    name: 'US Dollar',
    code: 'USD',
    symbol: '$',
    exchangeRate: 1,
    countryCodes: ['US']
  },
  'fiat-GBP': {
    id: 'fiat-GBP',
    name: 'British Pound',
    code: 'GBP',
    symbol: '£',
    exchangeRate: 0.77,
    countryCodes: ['GB']
  },
  'fiat-EUR': {
    id: 'fiat-EUR',
    name: 'Euro',
    code: 'GBP',
    symbol: '€',
    exchangeRate: 1.13,
    countryCodes: ['FR']
  },
  'token-ETH': {
    id: 'token-ETH',
    // __typename: 'Token',
    symbol: 'ETH',
    name: 'Ether'
  },
  'token-DAI': {
    id: 'token-DAI',
    // __typename: 'Token',
    contract: '0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359',
    name: 'DAI Stablecoin',
    symbol: 'DAI',
    decimals: '18'
  },
  'token-USDC': {
    id: 'token-USDC',
    contract: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    // __typename: 'Token',
    name: 'USDC Stablecoin',
    symbol: 'USDC',
    decimals: '6'
  },
  'token-GUSD': {
    id: 'token-GUSD',
    contract: '0x056fd409e1d7a124bd7017459dfea2f387b6d5cd',
    __typename: 'Token',
    name: 'Gemini Dollar',
    symbol: 'GUSD',
    decimals: '2'
  }
}
