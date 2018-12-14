import keyMirror from 'utils/keyMirror'

import { storeData } from '../tools'

export const AppConstants = keyMirror(
  {
    STORE_ACTIVATION: null,
  },
  'App'
)
 
export function storeActivation(activated) {
  storeData('activated', !!activated)

  return {
    type: AppConstants.STORE_ACTIVATION,
    activated,
  }
}
