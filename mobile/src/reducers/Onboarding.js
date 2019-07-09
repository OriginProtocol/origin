'use strict'

import { OnboardingConstants } from 'actions/Onboarding'
import get from 'lodash.get'

const initialState = {
  attestations: [],
  firstName: null,
  lastName: null,
  avatarUri: null,
  noRewardsDismissed: false,
  skippedAttestations: [],
  growth: null,
  complete: false
}

export default function Onboarding(state = initialState, action = {}) {
  switch (action.type) {
    case OnboardingConstants.ADD_ATTESTATION:
      return {
        ...state,
        // Safely get to handle old persisted states that did not include
        attestations: [...get(state, 'attestations', []), action.attestation]
      }

    case OnboardingConstants.ADD_SKIPPED_ATTESTATION:
      return {
        ...state,
        skippedAttestations: [
          // Safely get to handle old persisted states that did not include
          ...get(state, 'skippedAttestations', []),
          action.attestationName
        ]
      }

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
