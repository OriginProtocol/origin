import get from 'lodash/get'

const websiteAttestationEnabled =
  process.env.ENABLE_WEBSITE_ATTESTATION === 'true'

export function unpublishedStrength({ props, state }) {
  // TODO: Retrieve stregths from GraphQL?
  const profile = get(props, 'identity') || {}
  const verifiedAttestations = mapVerifiedAttestations(profile)

  let strength = 0
  if (!profile.firstName && state.firstName) strength += 10
  if (!profile.lastName && state.lastName) strength += 10
  if (!profile.description && state.description) strength += 10
  if (!profile.avatarUrl && state.avatarUrl) strength += 10
  if (!verifiedAttestations.emailVerified && state.emailAttestation)
    strength += 10
  if (!verifiedAttestations.phoneVerified && state.phoneAttestation)
    strength += 10
  if (!verifiedAttestations.facebookVerified && state.facebookAttestation)
    strength += 10
  if (!verifiedAttestations.googleVerified && state.googleAttestation)
    strength += 10
  if (!verifiedAttestations.twitterVerified && state.twitterAttestation)
    strength += 10
  if (!verifiedAttestations.airbnbVerified && state.airbnbAttestation)
    strength += websiteAttestationEnabled ? 5 : 10
  if (!verifiedAttestations.websiteVerified && state.websiteAttestation)
    strength += websiteAttestationEnabled ? 5 : 0

  // TODO: Add strength for KaKao, GitHub, Linkedin and WeChat

  return strength
}

export function changesToPublishExist({ props, state }) {
  const profile = get(props, 'identity') || {}
  const verifiedAttestations = mapVerifiedAttestations(profile)

  return !(
    (profile.firstName || '') === state.firstName &&
    (profile.lastName || '') === state.lastName &&
    (profile.description || '') === state.description &&
    (profile.avatarUrl || '') === state.avatarUrl &&
    !!verifiedAttestations.emailVerified ===
      (!!state.emailAttestation || !!state.emailVerified) &&
    !!verifiedAttestations.phoneVerified ===
      (!!state.phoneAttestation || !!state.phoneVerified) &&
    !!verifiedAttestations.facebookVerified ===
      (!!state.facebookAttestation || !!state.facebookVerified) &&
    !!verifiedAttestations.googleVerified ===
      (!!state.googleAttestation || !!state.googleVerified) &&
    !!verifiedAttestations.twitterVerified ===
      (!!state.twitterAttestation || !!state.twitterVerified) &&
    !!verifiedAttestations.airbnbVerified ===
      (!!state.airbnbAttestation || !!state.airbnbVerified) &&
    !!verifiedAttestations.websiteVerified ===
      (!!state.websiteAttestation || !!state.websiteVerified) &&
    !!verifiedAttestations.kakaoVerified ===
      (!!state.kakaoAttestation || !!state.kakaoVerified) &&
    !!verifiedAttestations.githubVerified ===
      (!!state.githubAttestation || !!state.githubVerified) &&
    !!verifiedAttestations.linkedinVerified ===
      (!!state.linkedinAttestation || !!state.linkedinVerified) &&
    !!verifiedAttestations.wechatVerified ===
      (!!state.wechatAttestation || !!state.wechatVerified)
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

export function mapVerifiedAttestations(profile = {}) {
  const verifiedAttestations = {}

  Array.from(profile.verifiedAttestations || []).forEach(attestation => {
    verifiedAttestations[`${attestation.id}Verified`] = true
  })

  return verifiedAttestations
}
