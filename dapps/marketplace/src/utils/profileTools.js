import get from 'lodash/get'
import { fbt } from 'fbt-runtime'

const websiteAttestationEnabled =
  process.env.ENABLE_WEBSITE_ATTESTATION === 'true'

export function unpublishedStrength({ props, state }) {
  // TODO: Retrieve stregths from GraphQL?
  const profile = get(props, 'identity') || {}
  const allProviders = props.attestationProviders
  const verifiedAttestations = (profile.verifiedAttestations || []).map(
    att => att.id
  )

  let strength = allProviders.reduce((sum, provider) => {
    if (
      verifiedAttestations.includes(provider) ||
      !state[`${provider}Attestation`]
    ) {
      return sum
    }

    switch (provider) {
      case 'email':
      case 'phone':
      case 'facebook':
      case 'google':
      case 'twitter':
        sum += 10
        break
      case 'airbnb':
        sum += websiteAttestationEnabled ? 5 : 10
        break
      case 'website':
        sum += websiteAttestationEnabled ? 5 : 0
    }

    // TODO: Add strength for KaKao, GitHub, Linkedin and WeChat

    return sum
  }, 0)

  if (!profile.firstName && state.firstName) strength += 10
  if (!profile.lastName && state.lastName) strength += 10
  if (!profile.description && state.description) strength += 10
  if (!profile.avatarUrl && state.avatarUrl) strength += 10

  return strength
}

export function changesToPublishExist({ props, state }) {
  const profile = get(props, 'identity') || {}
  const verifiedAttestations = (profile.verifiedAttestations || []).map(
    att => att.id
  )
  const allProviders = props.attestationProviders

  const attestationChanges = allProviders.reduce((hasChange, att) => {
    if (
      verifiedAttestations.includes(att.id) ===
      (!!state[`${att.id}Attestation`] || !!state[`${att.id}Verified`])
    ) {
      return true
    }

    return hasChange
  }, false)

  return !(
    (profile.firstName || '') === state.firstName &&
    (profile.lastName || '') === state.lastName &&
    (profile.description || '') === state.description &&
    (profile.avatarUrl || '') === state.avatarUrl &&
    attestationChanges
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

export function getProviderDisplayName(provider) {
  switch (provider) {
    case 'email':
      return fbt('Email', 'Email')
    case 'phone':
      return fbt('Phone', 'Phone')
    case 'airbnb':
      return fbt('Airbnb', 'Airbnb')
    case 'website':
      return fbt('Website', 'Website')
    case 'github':
      return fbt('GitHub', 'GitHub')
    case 'facebook':
      return fbt('Facebook', 'Facebook')
    case 'twitter':
      return fbt('Twitter', 'Twitter')
    case 'google':
      return fbt('Google', 'Google')
    case 'kakao':
      return fbt('Kakao', 'Kakao')
    case 'linkedin':
      return fbt('LinkedIn', 'LinkedIn')
    case 'wechat':
      return fbt('WeChat', 'WeChat')
  }

  console.error(`Unknown attestation provider: ${provider}`)
  return provider
}
