'use strict'

import keyMirror from 'utils/keyMirror'

export const OnboardingConstants = keyMirror(
  {
    SET_EMAIL_ATTESTATION: null,
    SET_EMAIL_VERIFIED: null,
    SET_PHONE_ATTESTATION: null,
    SET_PHONE_VERIFIED: null,
    SET_NAME: null,
    SET_AVATAR_URI: null,
    SET_COMPLETE: null,
    RESET: null
  },
  'ONBOARDING'
)

export function setEmailAttestation(emailAttestation) {
  return {
    type: OnboardingConstants.SET_EMAIL_ATTESTATION,
    emailAttestation
  }
}

export function setEmailVerified(emailVerified) {
  return {
    type: OnboardingConstants.SET_EMAIL_VERIFIED,
    emailVerified
  }
}

export function setPhoneAttestation(phoneAttestation) {
  return {
    type: OnboardingConstants.SET_PHONE_ATTESTATION,
    phoneAttestation
  }
}

export function setPhoneVerified(phoneVerified) {
  return {
    type: OnboardingConstants.SET_PHONE_VERIFIED,
    phoneVerified
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

export function reset() {
  return {
    type: OnboardingConstants.RESET
  }
}
