import agent from '@/utils/agent'
import { apiUrl } from '@/constants'

export const EDIT_USER_PENDING = 'EDIT_USER_PENDING'
export const EDIT_USER_SUCCESS = 'EDIT_USER_SUCCESS'
export const EDIT_USER_ERROR = 'EDIT_USER_ERROR'
export const FETCH_USER_PENDING = 'FETCH_USER_PENDING'
export const FETCH_USER_SUCCESS = 'FETCH_USER_SUCCESS'
export const FETCH_USER_ERROR = 'FETCH_USER_ERROR'

function editUserPending() {
  return {
    type: EDIT_USER_PENDING
  }
}

function editUserSuccess(payload) {
  return {
    type: EDIT_USER_SUCCESS,
    payload
  }
}

function editUserError(error) {
  return {
    type: EDIT_USER_ERROR,
    error
  }
}

function fetchUserPending() {
  return {
    type: FETCH_USER_PENDING
  }
}

function fetchUserSuccess(payload) {
  return {
    type: FETCH_USER_SUCCESS,
    payload
  }
}

function fetchUserError(error) {
  return {
    type: FETCH_USER_ERROR,
    error
  }
}

export function editUser({ phone, revisedScheduleAgreedAt, termsAgreedAt }) {
  return dispatch => {
    dispatch(editUserPending())

    return agent
      .post(`${apiUrl}/api/user`)
      .send({ phone, revisedScheduleAgreedAt, termsAgreedAt })
      .then(response => dispatch(editUserSuccess(response.body)))
      .catch(error => {
        dispatch(editUserError(error))
        throw error
      })
  }
}

export function fetchUser() {
  return dispatch => {
    dispatch(fetchUserPending())

    agent
      .get(`${apiUrl}/api/user`)
      .then(response => dispatch(fetchUserSuccess(response.body)))
      .catch(error => {
        dispatch(fetchUserError(error))
        throw error
      })
  }
}
