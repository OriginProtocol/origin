import { DevicesConstants } from 'actions/Devices'

const initialState = {
  devices: [],
}

export default function Devices(state = initialState, action = {}) {
  switch (action.type) {
    case DevicesConstants.SET_DEVICES:
      return { ...state, devices: action.devices }
  }
  
  return state
}
