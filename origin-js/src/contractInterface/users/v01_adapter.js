import Web3 from 'web3'
import stringify from 'json-stable-stringify'

import AttestationObject from '../../models/attestation'
import { IDENTITY_DATA_TYPE, IpfsDataStore } from '../../ipfsInterface/store'


export default class V01_UsersAdapter {
  constructor({ contractService, ipfsService, blockEpoch }) {
    this.contractService = contractService
    this.ipfsDataStore = new IpfsDataStore(ipfsService)
    this.contractName = 'IdentityEvents'
    this.blockEpoch = blockEpoch || 0
    // FIXME: get this from env var
    this.issuerAddress = '0x99C03fBb0C995ff1160133A8bd210D0E77bCD101'
  }

  /**
   * Creates or updates an identity for the current account.
   * If the identity already exists:
   *   - profile is overwritten.
   *   - new attestations are merged with already present ones.
   * @param {Object} profile
   * @param {Array<AttestationObject>} attestations
   * @param {transactionHashCallback:func,confirmationCallback:func} options
   * @return {Promise<txReceipt>}
   * @throws {Error}
   */
  async set({ profile, attestations = [], options = {} }) {
    const address = await this.contractService.currentAccount()
    console.log(`V01 ADAPTER set() - address=${address} profile=${JSON.stringify(profile)} attestation=${JSON.stringify(attestations)}`)

    // Load existing identity, if any.
    let ipfsHash = await this._getIdentityIpfsHash(address)
    const ipfsIdentity = ipfsHash ?
      await this.ipfsDataStore.load(IDENTITY_DATA_TYPE, ipfsHash) :
      { schemaId: 'https://schema.originprotocol.com/identity_1.0.0.json' }

    // Overwrite profile.
    profile.schemaId = 'https://schema.originprotocol.com/profile_2.0.0.json'
    profile.ethAddress = address
    ipfsIdentity.profile = profile

    // Merge attestations passed as argument with existing ones.
    ipfsIdentity.attestations = this._mergeAttestations(ipfsIdentity.attestations || [], attestations)

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
   *    attestations: Array<AttestationObject>,
   *    address: string,
   *    identityAddress: string}>|false}
   */
  async get(address) {
    console.log("V01 ADAPTER - GET for address=", address)
    const account = await this.contractService.currentAccount()
    address = address || account
    console.log("V01 ADAPTER GET: looking up using address ", address)

    // Scan blockchain for identity events to get latest IPFS hash of identity, if any.
    const ipfsHash = await this._getIdentityIpfsHash(address)
    if (!ipfsHash) {
      console.log("V01 ADAPTER GET: no identity event found for ", address)
      return false
    }

    // Load identity from IPFS.
    const ipfsIdentity = await this.ipfsDataStore.load(IDENTITY_DATA_TYPE, ipfsHash)
    console.log("V01 ADAPTER GET: identity from ipfs= ", JSON.stringify(ipfsIdentity))

    // Validate the profile data loaded from IPFS.
    const profile = ipfsIdentity.profile
    this._validateProfile(address, profile)

    // Validate the attestation data loaded from IPFS and create model objects from it.
    const validAttestations = ipfsIdentity.attestations.map(a => this._validateAttestation(address, a))
    const attestations = validAttestations.map(a => this._getAttestationModel(a))

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
    console.log("_getIdentityIpfsHash for address", address)
    // TODO: should this be cached like what marketplace does in getContract ???
    const contract = await this.contractService.deployed(
      this.contractService.contracts[this.contractName]
    )
    // Note: filtering using 'topics' rather than 'filter' due to
    // web3 bugs where 'filter' does not work with 'allEvents'.
    // See https://github.com/ethereum/web3.js/issues/1219
    const events = await contract.getPastEvents('allEvents', {
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
   * Note: The current logic only does deduping based on signature. It could potentially
   * be enhanced to only keep latest attestation per type and possibly to trim expired attestations.
   * @param {Array<Object>>} existingAttestations - Existing attestations as JSON objects.
   * @param {Array<AttestationObject>} attestations - New attestations to add as model objects.
   * @private
   * @return {Array<Object>} - Array of attestations in JSON format ready to be saved to IPFS.
   */
  _mergeAttestations(existingAttestations, newAttestations) {
    const seen = {}
    const allAttestations = [...existingAttestations, ...newAttestations.map(a => a.data)]
    return allAttestations.filter( (a) => {
      return seen[a.signature] ? false : (seen[a.signature] = true)
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
   * Validates an attestation by checking its signature matches against the
   * hash of (user's eth address, attestation data).
   * @param {string} account - User's ETH address.
   * @param {Object} attestation - Attestation data from the user's identity stored in IPFS.
   * @throws {Error} If validation fails.
   * @private
   */
  _validateAttestation(account, attestation) {
    // Note: we use stringify rather than the default JSON.stringify
    // to produce a deterministic JSON representation.
    const attestationJson = stringify(attestation.data)
    const message = Web3.utils.soliditySha3(account, Web3.utils.sha3(attestationJson))
    const messageHash = this.contractService.web3.eth.accounts.hashMessage(message)
    const issuerAddress = this.contractService.web3.eth.accounts.recover(messageHash, attestation.signature, true)
    if (issuerAddress !== this.issuerAddress) {
      throw new Error(
        `Attestation signature validation failure.
        Expected issuer ${this.issuerAddress}, got ${issuerAddress}`)
    }
  }

  /**
   * Computes topic compatible with Attestation model.
   * @param {Object} attestation - Attestation data from the user's identity stored in IPFS.
   * @private
   */
  _getModelTopic(attestation) {
    if (attestation.data.attestation.site) {
      const siteName = attestation.data.attestation.site.siteName
      if (siteName === 'facebook.com') {
        return 3
      } else if (siteName === 'twitter.com') {
        return 4
      } else if (siteName === 'airbnb.com') {
        return 5
      } else {
        throw new Error(`Unexpected siteName for attestation ${attestation}`)
      }
    } else if (attestation.data.attestation.phone) {
      return 10
    } else if (attestation.data.attestation.email) {
      return 11
    } else {
      throw new Error(`Failed extracting topic from attestation ${attestation}`)
    }
  }

  /**
   * Creates an Attestation model object based on an attestation stored in IPFS.
   * @param {Object} attestation - Attestation data from IPFS.
   * @return {AttestationObject}
   * @throws {Error}
   * @private
   */
  _getAttestationModel(attestation) {
    const topic = this._getModelTopic(attestation)
    const data = attestation.data
    const signature = attestation.signature
    return new AttestationObject({ topic, data, signature })
  }
}
