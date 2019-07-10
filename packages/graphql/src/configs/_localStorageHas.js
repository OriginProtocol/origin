module.exports = function localStorageHas(prop, value) {
  if (
    typeof window === 'undefined' ||
    typeof window.localStorage === 'undefined'
  )
    return false
  return window.localStorage[prop] === value ? true : false
}
