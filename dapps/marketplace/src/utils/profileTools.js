import get from 'lodash/get'

const websiteAttestationEnabled =
  process.env.ENABLE_WEBSITE_ATTESTATION === 'true'

export function unpublishedStrength({ props, state }) {
  // TODO: Retrieve stregths from GraphQL?
  const profile = get(props, 'identity') || {}
  let strength = 0
  if (!profile.firstName && state.firstName) strength += 10
  if (!profile.lastName && state.lastName) strength += 10
  if (!profile.description && state.description) strength += 10
  if (!profile.avatarUrl && state.avatarUrl) strength += 10
  if (!profile.emailVerified && state.emailAttestation) strength += 10
  if (!profile.phoneVerified && state.phoneAttestation) strength += 10
  if (!profile.facebookVerified && state.facebookAttestation) strength += 10
  if (!profile.googleVerified && state.googleAttestation) strength += 10
  if (!profile.twitterVerified && state.twitterAttestation) strength += 10
  if (!profile.airbnbVerified && state.airbnbAttestation)
    strength += websiteAttestationEnabled ? 5 : 10
  if (!profile.websiteVerified && state.websiteAttestation)
    strength += websiteAttestationEnabled ? 5 : 0
  return strength
}

export function changesToPublishExist({ props, state }) {
  const profile = get(props, 'identity') || {}
  return !(
    (profile.firstName || '') === state.firstName &&
    (profile.lastName || '') === state.lastName &&
    (profile.description || '') === state.description &&
    (profile.avatarUrl || '') === state.avatarUrl &&
    !!profile.emailVerified ===
      (!!state.emailAttestation || !!state.emailVerified) &&
    !!profile.phoneVerified ===
      (!!state.phoneAttestation || !!state.phoneVerified) &&
    !!profile.facebookVerified ===
      (!!state.facebookAttestation || !!state.facebookVerified) &&
    !!profile.googleVerified ===
      (!!state.googleAttestation || !!state.googleVerified) &&
    !!profile.twitterVerified ===
      (!!state.twitterAttestation || !!state.twitterVerified) &&
    !!profile.airbnbVerified ===
      (!!state.airbnbAttestation || !!state.airbnbVerified) &&
    !!profile.websiteVerified ===
      (!!state.websiteAttestation || !!state.websiteVerified)
  )
}

const ATTESTATIONS_LOCALSTORAGE_KEY = 'attestations'

export function getVerifiedAccounts({ wallet }, defaultValue = {}) {
  let attestations = window.localStorage.getItem(ATTESTATIONS_LOCALSTORAGE_KEY)

  if (!attestations) {
    return defaultValue
  }

  attestations = JSON.parse(attestations)

  if (attestations.wallet !== wallet) {
    return defaultValue
  }

  return attestations.data
}

export function updateVerifiedAccounts({ wallet, data }) {
  let attestations = window.localStorage.getItem(ATTESTATIONS_LOCALSTORAGE_KEY)

  if (!attestations) {
    window.localStorage.setItem(
      ATTESTATIONS_LOCALSTORAGE_KEY,
      JSON.stringify({
        wallet,
        data
      })
    )
    return
  }

  attestations = JSON.parse(attestations)

  if (attestations.wallet !== wallet) {
    // If it is a different wallet, overwrite previous values
    window.localStorage.setItem(
      ATTESTATIONS_LOCALSTORAGE_KEY,
      JSON.stringify({
        wallet,
        data
      })
    )
    return
  }

  window.localStorage.setItem(
    ATTESTATIONS_LOCALSTORAGE_KEY,
    JSON.stringify({
      ...attestations,
      data: {
        ...attestations.data,
        ...data
      }
    })
  )
}

export function clearVerifiedAccounts() {
  window.localStorage.removeItem(ATTESTATIONS_LOCALSTORAGE_KEY)
}
