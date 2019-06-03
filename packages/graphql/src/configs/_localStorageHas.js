module.exports = function localStorageHas(prop) {
  if (
    typeof window === 'undefined' ||
    typeof window.localStorage === 'undefined'
  )
    return false
  return window.localStorage[prop] ? true : false
}
