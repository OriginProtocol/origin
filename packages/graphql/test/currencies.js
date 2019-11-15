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
      'fiat-SGD',
      'token-ETH',
      'token-DAI',
      'token-OGN',
      'token-USDC',
      'token-GUSD',
      'token-OKB',
      'token-USDT'
    ])
  })

  it('get() should return a currency', async () => {
    const ids = await currencies.ids()
    for (const id of ids) {
      const currency = await currencies.get(id)
      assert(currency.name)
      assert(currency.code)
      assert.equal(typeof currency.priceInUSD, 'number')
      if (id.startsWith('fiat')) {
        assert(currency.countryCodes)
      } else {
        assert(currency.decimals)
      }
    }
  })
})
