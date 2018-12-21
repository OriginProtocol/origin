import { UserConstants } from '../actions/User'

export default function Users(state = [], action = {}) {
  switch (action.type) {

    case UserConstants.FETCH_ERROR:
      return state

    case UserConstants.FETCH_SUCCESS:
      const { user } = action
      const users = [...state]
      const i = users.findIndex(u => u.address === user.address)
      const { firstName, lastName } = user.profile || {}
      const userWithName = { ...user, fullName: (firstName || lastName) ? (`${firstName} ${lastName}`).trim() : 'Unnamed User' }

      return i === -1 ? [...users, userWithName] : users.map(u => u.address === user.address ? userWithName : u)

    default:
      return state
  }
}
