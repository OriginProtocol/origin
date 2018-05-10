import { UserConstants } from "../actions/User"

export default function Users(state = [], action = {}) {
  switch (action.type) {
    case UserConstants.FETCH_ERROR:
      return state

    case UserConstants.FETCH_SUCCESS:
      const { user } = action
      const users = [...state]
      const i = users.findIndex(u => u.address === user.address)

      return i === -1
        ? [...users, user]
        : users.map(u => (u.address === user.address ? user : u))

    default:
      return state
  }
}
