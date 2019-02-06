import get from 'lodash/get'

export default function unpublishedStrength({ props, state }) {
  // TODO: Retrieve stregths from GraphQL?
  const profile = get(props, 'identity') || {}
  let strength = 0
  if (!profile.firstName && state.firstName) strength += 10
  if (!profile.lastName && state.lastName) strength += 10
  if (!profile.description && state.description) strength += 10
  if (!profile.avatar && state.avatar) strength += 10
  if (!profile.emailVerified && state.emailAttestation) strength += 15
  if (!profile.phoneVerified && state.phoneAttestation) strength += 15
  if (!profile.facebookVerified && state.facebookAttestation) strength += 10
  if (!profile.twitterVerified && state.twitterAttestation) strength += 10
  if (!profile.airbnbVerified && state.airbnbAttestation) strength += 10
  return strength
}
