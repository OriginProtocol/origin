import { get } from 'lodash'

const CACHE = {}

/**
 * Creates a derivative function that caches a function call results for
 * duration.
 *
 * NOTE: This does not work like memoize, you must provide a unique key for the
 * results, it does not take into account arguments.
 *
 * @param {function} fn - function to wrap and cache its result
 * @param {string} key - the cache key to use for the function
 * @param {number} duration - the length of time to keep result cached
 * @return {function} - The wrapped function
 */
export function cached(fn, key, duration) {
  // no point in caching
  if (typeof fn !== 'function') {
    throw new TypeError('fn is not a function')
  }
  duration = typeof duration === 'number' ? duration : new Number(duration)

  const cachedFunc = function() {
    // Pull from cache if possible
    const now = new Number(new Date())
    const exp = get(CACHE, `${key}.exp`)
    if (exp && exp >= now - duration) {
      return get(CACHE, `${key}.data`)
    }

    const res = fn.apply(this, arguments)

    // Set cache
    CACHE[key] = {
      exp: now + duration,
      data: res
    }

    return res
  }

  return cachedFunc
}

/**
 * Creates a derivative function that caches a function call results for
 * duration.
 *
 * NOTE: This does not work like memoize, you must provide a unique key for the
 * results, it does not take into account arguments.
 *
 * @param {function} fn - function to wrap and cache its result
 * @param {string} key - the cache key to use for the function
 * @param {number} duration - the length of time to keep result cached
 * @return {function} - The wrapped function
 */
export function cachedAsync(fn, key, duration) {
  // no point in caching
  if (typeof fn !== 'function') {
    throw new TypeError('fn is not a function')
  }
  duration = typeof duration === 'number' ? duration : new Number(duration)

  const cachedFunc = async function() {
    // Pull from cache if possible
    const now = new Number(new Date())
    const exp = get(CACHE, `${key}.exp`)
    if (exp && exp >= now - duration) {
      return get(CACHE, `${key}.data`)
    }

    const res = await fn.apply(this, arguments)

    // Set cache
    // TODO: eslint identified a race here but... alternatives?
    CACHE[key] = {
      exp: now + duration,
      data: res
    }

    return res
  }

  return cachedFunc
}

export default {
  cached,
  cachedAsync
}
