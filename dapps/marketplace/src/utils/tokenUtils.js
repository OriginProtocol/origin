import { fbt } from 'fbt-runtime'

/**
 * Returns the display name of tokens
 * @param {String} token Can be one of [token-ETH, token-DAI, token-OGN]
 */
export function getTokenName(token) {
  switch (token) {
    case 'token-ETH':
      return fbt('Ethereum', 'Ethereum')
    case 'token-DAI':
      return fbt('Maker Dai', 'MakerDai')
    case 'token-OGN':
      return fbt('Origin Token', 'OriginToken')
  }

  return null
}

/**
 * Returns tooltip content for the given token
 * @param {String} token Can be one of [token-ETH, token-DAI, token-OGN]
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
  }

  return null
}

/**
 * Returns the token symbol from it's id
 * @param {String} token Can be one of [token-ETH, token-DAI, token-OGN]
 */
export function getTokenSymbol(token) {
  // token-ETH => ETH, token-DAI => token-OGN => OGN
  return token ? token.split('-').pop() : null
}

export const tokenToCoinLogoMap = {
  'token-ETH': 'eth',
  'token-DAI': 'dai',
  'token-OGN': 'ogn'
}
