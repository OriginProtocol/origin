import { fetchUser } from 'actions/User'

import keyMirror from 'utils/keyMirror'

import origin from '../services/origin'
import {
  upsert as upsertTransaction,
  update as updateTransaction
} from 'actions/Transaction'

export const ProfileConstants = keyMirror(
  {
    FETCH: null,
    FETCH_SUCCESS: null,
    FETCH_ERROR: null,
    UPDATE: null,

    DEPLOY: null,
    DEPLOY_SUCCESS: null,
    DEPLOY_IN_PROGRESS: null,
    DEPLOY_ERROR: null,
    DEPLOY_RESET: null,

    ADD_ATTESTATION: null,

    RESET: null
  },
  'PROFILE'
)

export const oldIdentityVersion = '000'
export const newIdentityVersion = '001'

export function fetchProfile() {
  return async function(dispatch) {
    const user = await origin.users.get()

    dispatch({
      type: ProfileConstants.FETCH_SUCCESS,
      user
    })
  }
}

export function updateProfile(data) {
  return { type: ProfileConstants.UPDATE, ...data }
}

export function addAttestation(attestation) {
  return { type: ProfileConstants.ADD_ATTESTATION, attestation }
}

export function deployProfile() {
  return async function(dispatch, getState) {
    dispatch({ type: ProfileConstants.DEPLOY })
    let confirmationReceived = false

    const {
      profile: { provisional, published },
      wallet: { address }
    } = getState()

    const userData = {
      profile: {
        firstName: provisional.firstName,
        lastName: provisional.lastName,
        description: provisional.description,
        avatar: provisional.pic
      },
      attestations: [],
      options: {
        transactionHashCallback: hash => {
          dispatch(
            upsertTransaction({
              transactionHash: hash,
              transactionTypeKey: 'updateProfile',
              timestamp: Date.now() / 1000,
              confirmationCount: 0
            })
          )
          dispatch({
            type: ProfileConstants.DEPLOY_IN_PROGRESS,
            hash
          })
        },
        confirmationCallback: (confirmationCount, transactionReceipt) => {
          dispatch(updateTransaction(confirmationCount, transactionReceipt))

          // only dispatch profile events on the first confirmation
          if (!confirmationReceived) {
            confirmationReceived = true
            dispatch({ type: ProfileConstants.DEPLOY_SUCCESS })
            dispatch(fetchUser(address))
          }
        }
      }
    }

    if (!published.facebook && provisional.facebook) {
      userData.attestations.push(provisional.facebook)
    }

    if (!published.twitter && provisional.twitter) {
      userData.attestations.push(provisional.twitter)
    }

    if (!published.email && provisional.email) {
      userData.attestations.push(provisional.email)
    }

    if (!published.phone && provisional.phone) {
      userData.attestations.push(provisional.phone)
    }

    if (!published.airbnb && provisional.airbnb) {
      userData.attestations.push(provisional.airbnb)
    }

    try {
      await origin.users.set(userData)
    } catch (error) {
      console.error('Error occurred deploying profile', error)
      dispatch({ type: ProfileConstants.DEPLOY_ERROR, error })
    }
  }
}

export function deployProfileReset() {
  return { type: ProfileConstants.DEPLOY_RESET }
}

// Identity reset for the purpose of upgrading to a new identity version.
export function resetIdentity() {
  return { type: ProfileConstants.RESET }
}
