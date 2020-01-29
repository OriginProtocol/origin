import assert from 'assert'

import getUnitTokenValue from '../src/utils/unitTokenValue'

describe('getUnitTokenValue()', () => {
  it('should convert fixed value to big int string', () => {
    const amount = 12.3456
    const unitVal = getUnitTokenValue(amount, 18)

    assert(unitVal.toString() === '12345600000000000000')
  })

  it('should convert fixed value to big int string (using tokenID)', () => {
    const amount = 12.345678
    const unitVal = getUnitTokenValue(amount, 'token-USDT')

    assert(unitVal.toString() === '12345678')
  })

  it('Should truncate additional floating points', () => {
    const amount = '12.345645454'
    const unitVal = getUnitTokenValue(amount, 6)

    assert(unitVal.toString() === '12345645')
  })
})
