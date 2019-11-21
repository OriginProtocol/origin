import { fbt } from 'fbt-runtime'

/**
 * Returns the display name of tokens
 * @param {String} token Can be one of
 *  [token-ETH, token-DAI, token-OGN,
 *    token-OKB, token-USDT]
 */
export function getTokenName(token) {
  switch (token) {
    case 'token-ETH':
      return fbt('Ethereum', 'Ethereum')
    case 'token-DAI':
      return fbt('Maker Dai', 'MakerDai')
    case 'token-OGN':
      return fbt('Origin Token', 'OriginToken')
    case 'token-OKB':
      return fbt('OKB Token', 'OKBToken')
    case 'token-USDT':
      return fbt('Tether', 'Tether')
  }

  return null
}

/**
 * Returns tooltip content for the given token
 * @param {String} token Can be one of
 *  [token-ETH, token-DAI, token-OGN,
 *    token-OKB, token-USDT]
 */
export function getTokenTooltip(token) {
  switch (token) {
    case 'token-ETH':
      return fbt(
        'Ether is good for short term listings.',
        'pricingChooser.ether'
      )
    case 'token-DAI':
      return fbt(
        'Maker Dai is good for long term listings like rentals or property sales.',
        'pricingChooser.dai'
      )
    case 'token-OGN':
      return fbt('Useful for promoting other listings', 'pricingChooser.ogn')
    case 'token-OKB':
      return fbt(
        'For use with one of our exchange partners',
        'pricingChooser.okb'
      )
    case 'token-USDT':
      return fbt(
        'Tether is good for long term listings like rentals or property sales.',
        'pricingChooser.usdt'
      )
  }

  return null
}

/**
 * Returns the token symbol from it's id
 * @param {String} token Can be one of
 *  [token-ETH, token-DAI, token-OGN,
 *    token-OKB, token-USDT]
 */
export function getTokenSymbol(token) {
  // token-ETH => ETH, token-DAI => DAI,
  // token-OGN => OGN, token-OKB => OKB
  return token ? token.split('-').pop() : null
}

export const tokenToCoinLogoMap = {
  'token-ETH': 'eth',
  'token-DAI': 'dai',
  'token-OGN': 'ogn',
  'token-OKB': 'okb',
  'token-USDT': 'usdt'
}
