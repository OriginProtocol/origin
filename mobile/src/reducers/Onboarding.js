'use strict'

import { OnboardingConstants } from 'actions/Onboarding'

const initialState = {
  emailAttestation: null,
  emailVerified: false,
  phoneAttestation: null,
  phoneVerified: false,
  firstName: null,
  lastName: null,
  avatarUri: null
}

export default function Onboarding(state = initialState, action = {}) {
  switch (action.type) {
    case OnboardingConstants.SET_EMAIL_ATTESTATION:
      return { ...state, emailAttestation: action.emailAttestation }

    case OnboardingConstants.SET_EMAIL_VERIFIED:
      return { ...state, emailVerified: action.emailVerified }

    case OnboardingConstants.SET_PHONE_ATTESTATION:
      return { ...state, phoneAttestation: action.phoneAttestation }

    case OnboardingConstants.SET_PHONE_VERIFIED:
      return { ...state, phoneVerified: action.phoneVerified }

    case OnboardingConstants.SET_NAME:
      return {
        ...state,
        firstName: action.payload.firstName,
        lastName: action.payload.lastName
      }

    case OnboardingConstants.SET_AVATAR_URI:
      return { ...state, avatarUri: action.avatarUri }

    case OnboardingConstants.RESET:
      return initialState
  }

  return state
}
