export default class User {
  /**
   * User constructor.
   * @param {string} address - User's ETH address.
   * @param {Object} profile - User's profile, validated against profile JSON schema.
   * @param {List<AttestationObject>} attestations
   * @param {Object} metadata - Identity metadata. Stores for example referrer info, if any.
   * @param {string} identityAddress - User's identity address. For legacy identity it is
   *        different from the user's address. For newer identity it the same.
   * @param {number} version - Identity contract version. 0 or 1.
   */
  constructor({ address, profile, attestations, metadata, identityAddress, version }) {
    this.address = address
    this.profile = profile
    this.attestations = attestations
    this.metadata = metadata
    this.identityAddress = identityAddress
    this.version = version
  }
}
