import { NotificationConstants } from 'actions/Notification'

export default function Notifications(state = [], action = {}) {
  switch (action.type) {
    case NotificationConstants.ADD: {
      const { notification } = action
      
      return [...state.filter(n => n.id !== notification.id), notification]
    }

    case NotificationConstants.REMOVE: {
      const { id } = action

      return state.filter(n => n.id !== id)
    }

    default:
      return state
  }
}
