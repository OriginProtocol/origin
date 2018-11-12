import * as lGet from 'lodash/get'
import * as lSet from 'lodash/set'

export function set(path, value) {
  let currentValue = {}
  try {
    currentValue = JSON.parse(window.localStorage.uiState)
  } catch(e) {
    /* Ignore */
  }
  lSet(currentValue, path, value)
  window.localStorage.uiState = JSON.stringify(currentValue)
}

 export function get(path, defaultValue) {
   let currentValue = {}
   try {
     currentValue = JSON.parse(window.localStorage.uiState)
   } catch(e) {
     /* Ignore */
   }
   return lGet(currentValue, path, defaultValue)
 }
