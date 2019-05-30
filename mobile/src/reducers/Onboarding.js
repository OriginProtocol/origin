'use strict'

import { OnboardingConstants } from 'actions/Onboarding'

const initialState = {
  emailAttestation: null,
  phoneAttestation: null,
  firstName: null,
  lastName: null,
  profileImage: null
}

export default function Onboarding(state = initialState, action = {}) {
  switch (action.type) {
    case OnboardingConstants.SET_EMAIL_ATTESTATION:
      return { ...state, emailAttestation: action.emailAttestation }

    case OnboardingConstants.SET_PHONE_ATTESTATION:
      return { ...state, phoneAttestation: action.phoneAttestation }

    case OnboardingConstants.SET_NAME:
      return {
        ...state,
        firstName: action.payload.firstName,
        lastName: action.payload.lastName
      }

    case OnboardingConstants.SET_PROFILE_IMAGE:
      return { ...state, profileImage: action.profileImage }
  }

  return state
}
