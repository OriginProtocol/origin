const scopedDebounce = (func, wait = 250, immediate) => {
  let timeouts = { unscoped: undefined }

  return function() {
    const context = this, args = arguments
    const scope = args[0] || 'unscoped'
    const later = function() {
      timeouts[scope] = null

      if (!immediate) func.apply(context, args)
    }

    const callNow = immediate && !timeouts[scope]

    clearTimeout(timeouts[scope])

    timeouts[scope] = setTimeout(later, wait)

    if (callNow) func.apply(context, args)
  }
}

export default scopedDebounce
