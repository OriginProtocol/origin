import { UserConstants } from '../actions/User'

export default function Users(state = [], action = {}) {
  switch (action.type) {

    case UserConstants.FETCH_ERROR:
      return state

    case UserConstants.FETCH_SUCCESS:
      const { user } = action
      const arr = [...state]

      // non-existent idenity will return { profile: undefined, attestations: undefined }
      if (!user.wallet) {
        return state
      }
      
      const i = arr.findIndex(u => u.wallet === user.wallet)
      const users = i > -1 ? [...arr, user] : arr

      return users

    default:
      return state
  }
}
