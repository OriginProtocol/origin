import * as lGet from 'lodash/get'
import * as lSet from 'lodash/set'
import unset from 'lodash/unset'

const memStore = {}

export default function store(type = 'localStorage', rootKey = 'uiState') {
  let storage = window.localStorage
  if (type === 'memory') storage = memStore
  if (type === 'sessionStorage') storage = window.sessionStorage

  function set(path, value) {
    let currentValue = {}
    try {
      currentValue = JSON.parse(storage[rootKey])
    } catch (e) {
      /* Ignore */
    }
    if (value === undefined) {
      unset(currentValue, path)
    } else {
      lSet(currentValue, path, value)
    }
    storage[rootKey] = JSON.stringify(currentValue)
  }

  function get(path, defaultValue) {
    let currentValue = {}
    try {
      currentValue = JSON.parse(storage[rootKey])
    } catch (e) {
      /* Ignore */
    }
    return lGet(currentValue, path, defaultValue)
  }

  return { get, set }
}
