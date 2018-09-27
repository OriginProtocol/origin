export default class User {
  constructor({ address, profile, attestations, identityAddress } = {}) {
    this.address = address
    this.profile = profile
    this.attestations = attestations
    this.identityAddress = identityAddress
  }
}
