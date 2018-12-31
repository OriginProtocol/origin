import AttestationObject from '../../models/attestation'
import { IDENTITY_DATA_TYPE, IpfsDataStore } from '../../ipfsInterface/store'

export default class V01_UsersAdapter {
  constructor({ contractService, ipfsService, blockEpoch }) {
    this.contractService = contractService
    this.ipfsDataStore = new IpfsDataStore(ipfsService)
    this.contractName = 'IdentityEvents'
    this.blockEpoch = blockEpoch || 0
  }

  /**
   * Creates or updates an identity for the current account.
   * If the identity already exists:
   *   - profile is overwritten.
   *   - new attestations are merged with already present ones.
   * @param {Object} profile
   * @param {List<AttestationObject>} attestations
   * @param options
   * @return {Promise<txReceipt>}
   * @throws {Error}
   */
  async set({ profile, attestations = [], options = {} }) {
    const address = await this.contractService.currentAccount()
    console.log("V01 ADAPTER set() - address=", address)

    // Validate profile and attestations passed as arguments.
    this._validateProfile(profile)
    attestations.map(this._validateAttestation)

    // Load existing identity, if any.
    let ipfsHash = await this._getIdentityIpfsHash(address)
    const ipfsIdentity = ipfsHash ?
      await this.ipfsDataStore.load(IDENTITY_DATA_TYPE, ipfsHash) :
      new Object()

    // Overwrite profile.
    ipfsIdentity.profile = profile

    // Merge attestations passed as argument with existing ones.
    ipfsIdentity.attestations = this._mergeAttestations(ipfsIdentity, attestations)

    // Save identity to IPFS.
    ipfsHash = await this.ipfsDataStore.save(IDENTITY_DATA_TYPE, ipfsIdentity)

    // Call contract to emit an IdentityUpdated event.
    const ipfsBytes = this.contractService.getBytes32FromIpfsHash(ipfsHash)
    return await this.contractService.call(
      this.contractName,
      'emitIdentityUpdated',
      [ipfsBytes],
      { ...options, from: address }
    )
  }

  /**
   * Loads an identity. Returns false if no identity found associated with the address.
   * @param address - User's wallet address. If not specified, uses current account.
   * @return {Promise<{
   *    profile: Object,
   *    attestations: List<AttestationObject>,
   *    address: string,
   *    identityAddress: string}>|false}
   */
  async get(address) {
    console.log("V01 ADAPTER - GET")
    const account = await this.contractService.currentAccount()
    address = address || account

    // Scan blockchain for identity events to get latest IPFS hash of identity, if any.
    const ipfsHash = await this._getIdentityIpfsHash(address)
    if (!ipfsHash) {
      console.log("Adapter v01 get - no identity event found for ", address)
      return false
    }

    // Load identity from IPFS.
    const ipfsIdentity = await this.ipfsDataStore.load(IDENTITY_DATA_TYPE, ipfsHash)
    console.log("Adapter v01 get - identity from ipfs= ", JSON.stringify(ipfsIdentity))

    const profile = ipfsIdentity.profile
    const attestations = ipfsIdentity.attestations
    return { address, identityAddress: address, profile, attestations }
  }

  /**
   * Returns identity address.
   * Kept for backward compatibility only since with v01 identity there is
   * no need for a mapping: the user's ETH address is the identity address.
   * @param address - ETH address of the user. If no address specified, use current account.
   * @return {Promise<string>}
   */
  async identityAddress(address) {
    const account = await this.contractService.currentAccount()
    return address || account
  }

  /**
   * Scans Identity events and returns latest ipfs hash or null
   * if no event found or identity was deleted.
   * @param {string} address - User's wallet address.
   * @return {Promise<string|null>}
   * @private
   */
  async _getIdentityIpfsHash(address) {
    // TODO: should this be cached like what marketplace does in getContract ???
    const contract = await this.contractService.deployed(
      this.contractService.contracts[this.contractName]
    )
    const events = await contract.getPastEvents('allEvents', {
      filter: { account: address },
      fromBlock: this.blockEpoch
    })
    let ipfsHash = null
    events.forEach(event => {
      if (event.event === 'IdentityUpdated') {
        ipfsHash = event.returnValues.ipfsHash
      } else if (event.event === 'IdentityDeleted') {
        ipfsHash = null
      } else {
        console.log(`Unexpected Identity event: ${event}`)
      }
    })
    return ipfsHash ? this.contractService.getIpfsHashFromBytes32(ipfsHash) : null
  }

  /**
   *
   * @param ipfsIdentity
   * @param attestations
   * @private
   * @return {List<AttestationObject>}
   */
  _mergeAttestations(ipfsIdentity, attestations) {
    // TODO: dedupe based on signature
    return attestations
  }

  /**
   * Validates profile data against schema. Throws in case of validation error.
   * @param profile
   * @private
   * @throws {Error}
   */
  _validateProfile(profile) {
    // TODO: validate against JSON schema
    return
  }

  /**
   * Validates attestation data against schema. Throws in case of validation error.
   * @param attestation
   * @private
   * @throws {Error}
   */
  _validateAttestation(attestation) {
    // TODO: validate against JSON schema
    return
  }
}
