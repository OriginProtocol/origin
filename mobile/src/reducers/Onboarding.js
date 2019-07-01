'use strict'

import { OnboardingConstants } from 'actions/Onboarding'

const initialState = {
  emailAttestation: null,
  phoneAttestation: null,
  firstName: null,
  lastName: null,
  avatarUri: null,
  noRewardsDismissed: false,
  verifiedAttestations: [],
  growth: null,
  complete: false
}

export default function Onboarding(state = initialState, action = {}) {
  switch (action.type) {
    case OnboardingConstants.SET_EMAIL_ATTESTATION:
      return { ...state, emailAttestation: action.emailAttestation }

    case OnboardingConstants.SET_PHONE_ATTESTATION:
      return { ...state, phoneAttestation: action.phoneAttestation }

    case OnboardingConstants.SET_VERIFIED_ATTESTATIONS:
      return { ...state, verifiedAttestations: action.verifiedAttestations }

    case OnboardingConstants.SET_NAME:
      return {
        ...state,
        firstName: action.payload.firstName,
        lastName: action.payload.lastName
      }

    case OnboardingConstants.SET_AVATAR_URI:
      return { ...state, avatarUri: action.avatarUri }

    case OnboardingConstants.SET_COMPLETE:
      return { ...state, complete: action.complete }

    case OnboardingConstants.SET_NO_REWARDS_DISMISSED:
      return { ...state, noRewardsDismissed: action.dismissed }

    case OnboardingConstants.SET_GROWTH:
      return { ...state, growth: action.value }

    case OnboardingConstants.RESET:
      return initialState
  }

  return state
}
