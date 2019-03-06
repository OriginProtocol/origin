const scopedDebounce = (callback, wait = 250, immediate) => {
  // provides a default scope for callbacks without an argument
  const timeouts = { unscoped: undefined }

  return function() {
    const context = this,
      args = arguments
    const scope = args[0] || 'unscoped'
    const later = function() {
      timeouts[scope] = null

      if (!immediate) callback.apply(context, args)
    }

    const callNow = immediate && !timeouts[scope]

    clearTimeout(timeouts[scope])

    timeouts[scope] = setTimeout(later, wait)

    if (callNow) callback.apply(context, args)
  }
}

export default scopedDebounce
