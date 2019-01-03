import origin from 'services/origin'

import keyMirror from 'utils/keyMirror'

export const DevicesConstants = keyMirror(
  {
    SET_DEVICES: null,
  },
  'Devices'
)
 
export function setDevices(devices) {
  return {
    type: DevicesConstants.SET_DEVICES,
    devices,
  }
}
