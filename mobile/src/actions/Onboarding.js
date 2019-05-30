'use strict'

import keyMirror from 'utils/keyMirror'

export const OnboardingConstants = keyMirror(
  {
    SET_EMAIL_ATTESTATION: null,
    SET_PHONE_ATTESTATION: null,
    SET_NAME: null,
    SET_PROFILE_IMAGE: null
  },
  'ONBOARDING'
)

export function setEmailAttestation(emailAttestation) {
  return {
    type: OnboardingConstants.SET_EMAIL_ATTESTATION,
    emailAttestation
  }
}

export function setPhoneAttestation(phoneAttestation) {
  return {
    type: OnboardingConstants.SET_PHONE_ATTESTATION,
    phoneAttestation
  }
}

export function setName(payload) {
  return {
    type: OnboardingConstants.SET_NAME,
    payload
  }
}

export function setProfileImage(profileImage) {
  return {
    type: OnboardingConstants.SET_PROFILE_IMAGE,
    profileImage
  }
}
