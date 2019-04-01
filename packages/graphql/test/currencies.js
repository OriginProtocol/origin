import assert from 'assert'

import currencies from '../src/utils/currencies'

describe('Currencies', () => {
  it('ids() should return all currency ids', async () => {
    const ids = await currencies.ids()
    assert.deepEqual(ids, [
      'fiat-USD',
      'fiat-GBP',
      'fiat-EUR',
      'fiat-KRW',
      'fiat-JPY',
      'fiat-CNY',
      'token-ETH',
      'token-DAI',
      'token-USDC',
      'token-GUSD'
    ])
  })

  it('get() should return a currency', async () => {
    const ids = await currencies.ids()
    for (const id of ids) {
      const currency = await currencies.get(id)
      assert(currency.name)
      assert(currency.code)
      // TODO assert it is a float
      assert(currency.priceInUSD)
      if (id.startsWith('fiat')) {
        assert(currency.countryCodes)
      } else {
        assert(currency.decimals)
      }
    }
  })
})
