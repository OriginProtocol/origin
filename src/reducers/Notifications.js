import { NotificationConstants } from 'actions/Notification'

export default function Notifications(state = [], action = {}) {
  switch (action.type) {
  case NotificationConstants.FETCH:
    return action.notifications

  case NotificationConstants.ERROR:
    return state

  case NotificationConstants.UPDATE:
    return [
      ...state.filter(n => n.id !== action.id),
      { ...state.find(n => n.id), status: action.status }
    ]

  default:
    return state
  }
}
