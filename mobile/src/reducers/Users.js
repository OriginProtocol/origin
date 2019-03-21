import { UserConstants } from 'actions/User'

import { formattedAddress } from 'utils/user'

export default function Users(state = [], action = {}) {
  switch (action.type) {
    case UserConstants.FETCH_ERROR:
      return state

    case UserConstants.FETCH_SUCCESS: {
      const { user } = action
      const users = [...state]
      const i = users.findIndex(u => formattedAddress(u.address) === formattedAddress(user.address))
      const { firstName, lastName } = user.profile || {}
      const userWithName = {
        ...user,
        fullName: [firstName, lastName].join(' ').trim(),
      }

      return i === -1
        ? [...users, userWithName]
        : users.map(u => (
          formattedAddress(u.address) === formattedAddress(user.address) ? userWithName : u
        ))
    }

    default:
      return state
  }
}
