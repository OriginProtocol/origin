import memoize from 'lodash/memoize'

const MapCache = memoize.Cache
const DontCache = ['0x', '0x0000000000000000000000000000000000000000']

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

    // Only cache truthy results
    if (result && !DontCache.includes(result)) {
      memorized.cache = cache.set(key, result) || cache
    }

    return result
  }
  memorized.cache = new (memorize.Cache || MapCache)()
  return memorized
}
