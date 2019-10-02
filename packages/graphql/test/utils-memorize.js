import assert from 'assert'

import memorize from '../src/utils/memorize'

const trueFuncRaw = () => {
  return true
}

const falseFuncRaw = () => {
  return false
}

const addFiveRaw = v => {
  return v + 5
}

const subFiveRaw = v => {
  return v - 5
}

const returnThisRaw = (k, v) => {
  return v
}

/**
 * Internal cache storage makes storage choices according to arg type:
 * - numbers are stored in `hash` hash map as string keys
 * - strings are stored in `string` Hash map as string keys
 * - others are stored in Map (e.g. `undefined`, `true`)
 */

describe('Memorize utility', () => {
  it('should cache values except falsey with no args', async () => {
    const trueFunc = memorize(trueFuncRaw)
    const falseFunc = memorize(falseFuncRaw)

    assert(trueFunc() === true, 'trueFunc did not return true')
    assert(
      trueFunc.cache.__data__.map.get(undefined) === true,
      'true value not cached'
    )

    assert(falseFunc() === false, 'falseFunc did not return false')
    assert(
      falseFunc.cache.__data__.map.get(undefined) === undefined,
      'false value cached'
    )
  })

  it('should cache values except falsey with args', async () => {
    const addFive = memorize(addFiveRaw)
    const subFive = memorize(subFiveRaw)

    assert(addFive(1) === 6, 'addFive did not return sum')
    assert(
      addFive.cache.__data__.hash.__data__['1'] === 6,
      'addFive value not cached'
    )

    assert(subFive(6) === 1, 'subFive did not return correct value')
    assert(subFive.cache.__data__.hash.__data__['6'] === 1, 'value not cached')

    assert(subFive(5) === 0, 'subFive did not return correct value')
    assert(
      subFive.cache.__data__.hash.__data__['5'] === undefined,
      'falsey value cached'
    )
  })

  it('should not cache any falsey values', async () => {
    const returnThis = memorize(returnThisRaw)

    assert(returnThis('zero', 0) === 0, 'returnThis unexpected return')
    assert(
      returnThis.cache.__data__.string.__data__['zero'] === undefined,
      'zero value cached'
    )

    assert(returnThis('nullhex', '0x') === '0x', 'returnThis unexpected return')
    assert(
      returnThis.cache.__data__.string.__data__['nullhex'] === undefined,
      'nullhex value cached'
    )

    assert(
      returnThis('badzerohexbyte', '0x0') === '0x0',
      'returnThis unexpected return'
    )
    assert(
      returnThis.cache.__data__.string.__data__['badzerohexbyte'] === undefined,
      'invalid zero hex byte value cached'
    )

    assert(
      returnThis('zerohexbyte', '0x00') === '0x00',
      'returnThis unexpected return'
    )
    assert(
      returnThis.cache.__data__.string.__data__['zerohexbyte'] === undefined,
      'zero hex byte value cached'
    )

    assert(returnThis('null', null) === null, 'returnThis unexpected return')
    assert(
      returnThis.cache.__data__.string.__data__['null'] === undefined,
      'null value cached'
    )

    assert(returnThis('false', false) === false, 'returnThis unexpected return')
    assert(
      returnThis.cache.__data__.string.__data__['false'] === undefined,
      'false value cached'
    )
  })
})
