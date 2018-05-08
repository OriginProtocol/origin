import keyMirror from 'utils/keyMirror'
import origin from '../services/origin'

export const ProfileConstants = keyMirror(
  {
    FETCH: null,
    FETCH_SUCCESS: null,
    FETCH_ERROR: null,
    UPDATE: null,

    DEPLOY: null,
    DEPLOY_SUCCESS: null,
    DEPLOY_ERROR: null,

    ADD_ATTESTATION: null
  },
  'PROFILE'
)

export function fetchProfile() {
  return async function(dispatch) {
    var user = await origin.users.get(),
        wallet = await origin.contractService.currentAccount()

    dispatch({
      type: ProfileConstants.FETCH_SUCCESS,
      user,
      wallet
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
    const {
      profile: { provisional, published }
    } = getState()

    let userData = {
      profile: {
        claims: {
          name: `${provisional.firstName} ${provisional.lastName}`,
          customFields: [
            { field: 'firstName', value: provisional.firstName },
            { field: 'lastName', value: provisional.lastName },
            { field: 'description', value: provisional.description }
          ]
        }
      },
      attestations: []
    }

    if (!published.facebook && provisional.facebook) {
      userData.attestations.push(provisional.facebook)
    }

    if (!published.email && provisional.email) {
      userData.attestations.push(provisional.email)
    }

    var user = await origin.users.set(userData)
    dispatch({ type: ProfileConstants.DEPLOY_SUCCESS, user })
  }
}
