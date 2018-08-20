import { NotificationConstants } from 'actions/Notification'

export default function Notifications(state = [], action = {}) {
  switch (action.type) {
  case NotificationConstants.FETCH:
    return action.notifications

  case NotificationConstants.ERROR:
    return state

  default:
    return state
  }
}
