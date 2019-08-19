import {
  FETCH_EVENTS_PENDING,
  FETCH_EVENTS_SUCCESS,
  FETCH_EVENTS_ERROR
} from '../actions/event'

const initialState = {
  isLoading: true,
  events: [],
  error: null
}

export default function eventsReducer(state = initialState, action) {
  switch (action.type) {
    case FETCH_EVENTS_PENDING:
      return {
        ...state,
        isLoading: true
      }
    case FETCH_EVENTS_SUCCESS:
      return {
        ...state,
        isLoading: false,
        events: action.payload,
        error: null
      }
    case FETCH_EVENTS_ERROR:
      return {
        ...state,
        isLoading: false,
        error: action.error
      }
    default:
      return state
  }
}
