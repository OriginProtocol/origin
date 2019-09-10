import get from 'lodash/get'
import { fbt } from 'fbt-runtime'

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

    return sum + 10
  }, 0)

  if (!profile.firstName && state.firstName) strength += 10
  if (!profile.lastName && state.lastName) strength += 10
  if (!profile.description && state.description) strength += 10
  if (!profile.avatarUrl && state.avatarUrl) strength += 10

  if (strength > 100) {
    strength = 100
  }

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
    case 'telegram':
      return fbt('Telegram', 'Telegram')
    case 'website':
      return fbt('Website', 'Website')
  }

  console.error(`Unknown attestation provider: ${provider}`)
  return provider
}

export function getVerifiedTooltip(provider) {
  const displayName = getProviderDisplayName(provider)
  switch (provider) {
    case 'phone':
      return fbt('Phone Number Verified', 'profileTools.phoneNumberVerified')
    case 'airbnb':
    case 'github':
    case 'facebook':
    case 'twitter':
    case 'google':
    case 'kakao':
    case 'linkedin':
    case 'wechat':
    case 'telegram':
      return fbt(
        fbt.param('provider', displayName) + ' Account Verified',
        'profileTools.providerAccountVerified'
      )
    case 'email':
    case 'website':
    default:
      return fbt(
        fbt.param('provider', displayName) + ' Verified',
        'profileTools.providerVerified'
      )
  }
}
