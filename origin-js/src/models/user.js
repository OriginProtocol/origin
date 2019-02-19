export default class User {
  /**
   * User constructor.
   * @param {string} address - User's ETH address.
   * @param {Object} profile - User's profile, validated against profile JSON schema.
   * @param {List<AttestationObject>} attestations
   * @param {string} identityAddress - User's identity address. For legacy identity it is
   *        different from the user's address. For newer identity it the same.
   */
  constructor({ address, profile, attestations, identityAddress, version }) {
    this.address = address
    this.profile = profile
    this.attestations = attestations
    this.identityAddress = identityAddress
    this.version = version
  }
}
