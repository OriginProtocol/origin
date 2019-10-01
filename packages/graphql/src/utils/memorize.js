import memoize from 'lodash/memoize'

const MapCache = memoize.Cache
const DontCache = [
  '0x',
  '0x0',
  '0x00',
  '0x0000000000000000000000000000000000000000'
]

/**
 * memorize is essentially memoize but only caches truthy values.
 *
 * @param {function} the function to wrap
 * @param {function} function to use to derive the cache key
 * @returns {function} the wrapped funtion
 */
export default function memorize(func, resolver) {
  if (
    typeof func != 'function' ||
    (resolver != null && typeof resolver != 'function')
  ) {
    throw new TypeError('Not a function')
  }
  const memorized = function() {
    const args = arguments
    const key = resolver ? resolver.apply(this, args) : args[0]
    const cache = memorized.cache

    if (cache.has(key)) {
      return cache.get(key)
    }
    const result = func.apply(this, args)

    /**
     * We only want to cache truthy results, and we can't afford to cache
     * unresolved Promises here, either.  So make sure to set the cache only
     * after a Promise been resolved.
     */
    if (result instanceof Promise) {
      result.then(res => {
        if (res && !DontCache.includes(res)) {
          memorized.cache = cache.set(key, res) || cache
        }
      })
    } else {
      if (result && !DontCache.includes(result)) {
        memorized.cache = cache.set(key, result) || cache
      }
    }

    return result
  }
  memorized.cache = new (memorize.Cache || MapCache)()
  return memorized
}
