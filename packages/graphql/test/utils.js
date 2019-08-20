/**
 * This file contains tests for @origin/graphql/utils, it does NOT include test
 * utility functions functions!
 */
import assert from 'assert'

import { cached, cachedAsync } from '../src/utils/cached'

// random test functions
function sumOrig(a, b) {
  return a + b
}
async function subOrig(a, b) {
  await (() => {
    return new Promise(resolve => {
      setTimeout(() => resolve(), 100)
    })
  })()
  return a - b
}

describe('@origin/graphql utils', function() {
  describe('@origin/graphql/utils/cached', function() {
    it('should cache the results of a sync function', async function() {
      const sum = cached(sumOrig, 'sum', 2000)
      const result1 = sum(1, 2)
      assert(result1 === 3)

      // Try with an irrelevant function call
      const result2 = sum(1, 200)
      assert(result2 === 3, 'Results not pulled from cache')
    })

    it('should cache the results of an async function', async function() {
      const sub = cachedAsync(subOrig, 'sub', 2000)
      const result1 = await sub(2, 1)
      assert(result1 === 1)

      // Try with an irrelevant function call
      const result2 = await sub(200, 1)
      assert(result2 === 1, 'Results not pulled from cache')
    })
  })
})
