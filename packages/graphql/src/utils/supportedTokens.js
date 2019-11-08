// All supported tokens should go here
const tokensEnabled = [
  'token-ETH',
  'token-DAI',
  'token-OGN'
]

if (process.env.NODE_ENV === 'test' || process.env.ENABLE_OKB === 'true') {
  tokensEnabled.push('token-OKB')
}

export default tokensEnabled
