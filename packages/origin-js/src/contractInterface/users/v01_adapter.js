import Web3 from 'web3'
import stringify from 'json-stable-stringify'

import AttestationObject from '../../models/attestation'
import { IDENTITY_DATA_TYPE, IpfsDataStore } from '../../ipfsInterface/store'


export default class V01_UsersAdapter {
  constructor({ contractService, ipfsService, blockEpoch, attestationAccount }) {
    this.contractService = contractService
    this.ipfsDataStore = new IpfsDataStore(ipfsService)
    this.contractName = 'IdentityEvents'
    this.blockEpoch = blockEpoch || 0
    // TODO: As opposed to a single issuer address, add support for a list of valid addresses
    // in order to accommodate future use cases such as:
    //   - attestation server key rotation
    //   - 3rd party attestation servers
    this.issuerAddress = attestationAccount
    this.contract = null
  }

  async getContract() {
    if (!this.contract) {
      this.contract = await this.contractService.deployed(
        this.contractService.contracts[this.contractName]
      )
    }
    return this.contract
  }

  /**
   * Creates or updates an identity for the current account.
   * If the identity already exists:
   *   - profile is overwritten.
   *   - new attestations are merged with already present ones.
   * @param {{firstName:string, lastName:string, description:string, avatar:string}} profile object
   * @param {Array<AttestationObject>} attestations
   * @param {{transactionHashCallback:func, confirmationCallback:func}} options object
   * @return {Promise<txReceipt>}
   * @throws {Error}
   */
  async set({ profile, attestations = [], options = {} }) {
    const address = await this.contractService.currentAccount()

    // Load existing identity, if any and use it to populate newIpfsIdentity.
    let ipfsHash = await this._getIdentityIpfsHash(address)
    const currentIpfsIdentity = ipfsHash ?
      await this.ipfsDataStore.load(IDENTITY_DATA_TYPE, ipfsHash) : {}

    // Add required fields to the profile.
    profile.schemaId = 'https://schema.originprotocol.com/profile_2.0.0.json'
    profile.ethAddress = address

    // Validate the new attestations and merge them with the ones from the current profile.
    attestations.forEach( (attestation) => {
      if (!this._validateAttestation(address, attestation)) {
        throw new Error(`Invalid attestation ${attestation}`)
      }
    })
    const allAttestations = this._mergeAttestations(
      currentIpfsIdentity.attestations || [], attestations)

    const newIpfsIdentity = {
      schemaId: 'https://schema.originprotocol.com/identity_1.0.0.json',
      profile: profile,
      attestations: allAttestations
    }

    // Save new identity to IPFS.
    ipfsHash = await this.ipfsDataStore.save(IDENTITY_DATA_TYPE, newIpfsIdentity)

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
   *    attestations: Array<AttestationObject>,
   *    address: string,
   *    identityAddress: string}>|false}
   */
  async get(address) {
    const account = await this.contractService.currentAccount()
    address = address || account
    if (!address) {
      return false
    }

    // Scan blockchain for identity events to get latest IPFS hash of identity, if any.
    const ipfsHash = await this._getIdentityIpfsHash(address)
    if (!ipfsHash) {
      return false
    }

    // Load identity from IPFS.
    const ipfsIdentity = await this.ipfsDataStore.load(IDENTITY_DATA_TYPE, ipfsHash)

    // Validate the profile data loaded from IPFS.
    const profile = ipfsIdentity.profile
    this._validateProfile(address, profile)

    // Create model object and validate attestations loaded from IPFS.
    const attestations = ipfsIdentity.attestations
      .map(a => { return AttestationObject.create(a) })
      .filter(a => this._validateAttestation(address, a))

    // Pass-thru metadata information.
    const metadata = ipfsIdentity.metadata

    return { address, identityAddress: address, profile, attestations, metadata }
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
    if (!address) {
      return null
    }

    await this.getContract()
    // Note: filtering using 'topics' rather than 'filter' due to
    // web3 bugs where 'filter' does not work with 'allEvents'.
    // See https://github.com/ethereum/web3.js/issues/1219
    const events = await this.contract.getPastEvents('allEvents', {
      topics: [null, Web3.utils.padLeft(address.toLowerCase(), 64)],
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
   * Merge existing attestations on an identity with new attestations.
   *
   * Note: The current logic only does deduping based on signature. It could potentially
   * be enhanced to only keep latest attestation per type and also to trim expired attestations.
   *
   * @param {Array<Object>>} existingAttestations - Existing attestations loaded from IPFS.
   * @param {Array<AttestationObject>} newAttestations - New attestations to add as model objects.
   * @private
   * @return {Array<Object>} - Array of attestations in JSON format ready to be saved to IPFS.
   */
  _mergeAttestations(existingAttestations, newAttestations) {
    // The AttestationObject includes some field for the purpose of driving the UI
    // that we filter out before saving the attestation to IPFS.
    const newIpfsAttestation = newAttestations.map( (attestation) => {
      return {
        schemaId: attestation.schemaId,
        data: attestation.data,
        signature: attestation.signature
      }
    })
    const allAttestations = [...existingAttestations, ...newIpfsAttestation]

    const seen = {}
    return allAttestations.filter( (a) => {
      const signature = a.signature.bytes
      return seen[signature] ? false : (seen[signature] = true)
    })
  }

  /**
   * Validates profile data
   * @param {string} account - User's ETH address.
   * @param {Object} profile - Profile data from the user's identity stored in IPFS.
   * @throws {Error} If validation fails.
   * @private
   */
  _validateProfile(account, profile) {
    if (!profile.ethAddress) {
      throw new Error('Profile data is missing ethAddress')
    }
    if (profile.ethAddress.toLowerCase() !== account.toLowerCase()) {
      throw new Error(`Profile has ethAddress ${profile.ethAddress} but expected ${account}`)
    }
  }

  /**
   * Validates an attestation:
   *  1. check issuer address in attestation is a known address
   *  2. check signature matches against the ash of (user's eth address, attestation data).
   * @param {string} account - User's ETH address.
   * @param {AttestationObject} attestation
   * @return Boolean - True if attestation is valid, false otherwise.
   * @private
   */
  _validateAttestation(account, attestation) {
    if (this.issuerAddress.toLowerCase() !== attestation.data.issuer.ethAddress.toLowerCase()) {
      console.log(
        `Attestation issuer address validation failure.
        Account ${account}
        Expected issuer ${this.issuerAddress}, got ${attestation.data.issuer.ethAddress}`)
      return false
    }

    // Note: we use stringify rather than the default JSON.stringify
    // to produce a deterministic JSON representation of the data that was signed.
    // Similarly, we make sure to user checksummed eth address.
    const attestationJson = stringify(attestation.data)
    const message = Web3.utils.soliditySha3(
      Web3.utils.toChecksumAddress(account),
      Web3.utils.sha3(attestationJson)
    )
    const messageHash = this.contractService.web3.eth.accounts.hashMessage(message)
    const signerAddress = this.contractService.web3.eth.accounts.recover(
      messageHash, attestation.signature.bytes, true)
    if (signerAddress.toLowerCase() !== this.issuerAddress.toLowerCase()) {
      console.log(
        `Attestation signature validation failure.
        Account ${account}
        Expected issuer ${this.issuerAddress}, got ${signerAddress}`)
      return false
    }
    return true
  }
}
