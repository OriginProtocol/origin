import agent from '@/utils/agent'
import { apiUrl } from '@/constants'

export const FETCH_EVENTS_PENDING = 'FETCH_EVENTS_PENDING'
export const FETCH_EVENTS_SUCCESS = 'FETCH_EVENTS_SUCCESS'
export const FETCH_EVENTS_ERROR = 'FETCH_EVENTS_ERROR'

function fetchEventsPending() {
  return {
    type: FETCH_EVENTS_PENDING
  }
}

function fetchEventsSuccess(payload) {
  return {
    type: FETCH_EVENTS_SUCCESS,
    payload
  }
}

function fetchEventsError(error) {
  return {
    type: FETCH_EVENTS_ERROR,
    error
  }
}

export function fetchEvents() {
  return dispatch => {
    dispatch(fetchEventsPending())

    agent
      .get(`${apiUrl}/api/events`)
      .then(response => dispatch(fetchEventsSuccess(response.body)))
      .catch(error => {
        dispatch(fetchEventsError(error))
        throw error
      })
  }
}
