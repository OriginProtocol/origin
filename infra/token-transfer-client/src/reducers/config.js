import {
  FETCH_CONFIG_PENDING,
  FETCH_CONFIG_SUCCESS,
  FETCH_CONFIG_ERROR
} from '@/actions/config'

const initialState = {
  isLoading: true,
  config: {},
  error: null
}

export default function configReducer(state = initialState, action) {
  switch (action.type) {
    case FETCH_CONFIG_PENDING:
      return {
        ...state,
        isLoading: true
      }
    case FETCH_CONFIG_SUCCESS:
      return {
        ...state,
        isLoading: false,
        config: action.payload,
        error: null
      }
    case FETCH_CONFIG_ERROR:
      return {
        ...state,
        isLoading: false,
        error: action.error
      }
    default:
      return state
  }
}

export const getConfig = state => state.config
export const getError = state => state.error
export const getIsLoading = state => state.isLoading
