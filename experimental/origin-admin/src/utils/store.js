import * as lGet from 'lodash/get'
import * as lSet from 'lodash/set'

const memStore = {}

export default function store(type = 'localStorage') {
  let storage = window.localStorage
  if (type === 'memory') storage = memStore
  if (type === 'sessionStorage') storage = window.sessionStorage

  function set(path, value) {
    let currentValue = {}
    try {
      currentValue = JSON.parse(storage.uiState)
    } catch (e) {
      /* Ignore */
    }
    lSet(currentValue, path, value)
    storage.uiState = JSON.stringify(currentValue)
  }

  function get(path, defaultValue) {
    let currentValue = {}
    try {
      currentValue = JSON.parse(storage.uiState)
    } catch (e) {
      /* Ignore */
    }
    return lGet(currentValue, path, defaultValue)
  }

  return { get, set }
}
