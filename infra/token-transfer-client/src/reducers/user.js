import {
  EDIT_USER_PENDING,
  EDIT_USER_SUCCESS,
  EDIT_USER_ERROR,
  FETCH_USER_PENDING,
  FETCH_USER_SUCCESS,
  FETCH_USER_ERROR
} from '../actions/user'

const initialState = {
  isEditing: false,
  isLoading: true,
  error: null,
  user: null
}

export default function Session(state = initialState, action) {
  switch (action.type) {
    case EDIT_USER_PENDING:
      return {
        ...state,
        isEditing: true
      }
    case EDIT_USER_SUCCESS:
      return {
        ...state,
        isEditing: false,
        user: action.payload,
        error: null
      }
    case EDIT_USER_ERROR:
      return {
        ...state,
        isEditing: false,
        error: action.error
      }
    case FETCH_USER_PENDING:
      return {
        ...state,
        isLoading: true
      }
    case FETCH_USER_SUCCESS:
      return {
        ...state,
        isLoading: false,
        user: action.payload,
        error: null
      }
    case FETCH_USER_ERROR:
      return {
        ...state,
        isLoading: false,
        error: action.error
      }
    default:
      return state
  }
}

export const getUser = state => state.user
export const getError = state => state.error
export const getIsEditing = state => state.isEditing
export const getIsLoading = state => state.isLoading
