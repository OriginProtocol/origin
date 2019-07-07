'use strict'

import keyMirror from 'utils/keyMirror'

export const OnboardingConstants = keyMirror(
  {
    ADD_ATTESTATION: null,
    ADD_SKIPPED_ATTESTATION: null,
    SET_NAME: null,
    SET_AVATAR_URI: null,
    SET_COMPLETE: null,
    SET_NO_REWARDS_DISMISSED: null,
    SET_GROWTH: null,
    RESET: null
  },
  'ONBOARDING'
)

export function addAttestation(attestation) {
  return {
    type: OnboardingConstants.ADD_ATTESTATION,
    attestation
  }
}

export function addSkippedAttestation(attestationName) {
  return {
    type: OnboardingConstants.ADD_SKIPPED_ATTESTATION,
    attestationName
  }
}

export function setName(payload) {
  return {
    type: OnboardingConstants.SET_NAME,
    payload
  }
}

export function setAvatarUri(avatarUri) {
  return {
    type: OnboardingConstants.SET_AVATAR_URI,
    avatarUri
  }
}

export function setComplete(complete) {
  return {
    type: OnboardingConstants.SET_COMPLETE,
    complete
  }
}

export function setNoRewardsDismissed(dismissed) {
  return {
    type: OnboardingConstants.SET_NO_REWARDS_DISMISSED,
    dismissed
  }
}

export function setGrowth(value) {
  return {
    type: OnboardingConstants.SET_GROWTH,
    value
  }
}

export function reset() {
  return {
    type: OnboardingConstants.RESET
  }
}
