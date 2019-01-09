import AttestationObject from '../../models/attestation'
import {
  fromRpcSig,
  ecrecover,
  toBuffer,
  bufferToHex,
  pubToAddress
} from 'ethereumjs-util'
import Web3 from 'web3'
import { PROFILE_DATA_TYPE, IpfsDataStore } from '../../ipfsInterface/store'

const ClaimDataIsIpfsHash = [4, 5] // twitter & airbnb
const selfAttestationTopic = 13 // TODO: use the correct number here
const emptyAddress = '0x0000000000000000000000000000000000000000'

export default class V00_UsersAdapter {
  constructor({ contractService, ipfsService, blockEpoch, blockAttestattionV1 }) {
    this.contractService = contractService
    this.ipfsDataStore = new IpfsDataStore(ipfsService)
    this.web3EthAccounts = this.contractService.web3.eth.accounts
    this.contractName = 'V00_UserRegistry'
    this.blockEpoch = blockEpoch || 0
    this.blockAttestattionV1 = blockAttestattionV1 || 0
  }

  /**
   * Creates or updates an identity.
   * @param {string} profile - JSON profile data compliant with profile JSON schema.
   * @param {List<AttestationObject>} attestations
   * @param options
   * @return {Promise<txReceipt>}
   */
  async set({ profile, attestations = [], options = {} }) {
    if (profile) {
      const selfAttestation = await this.profileAttestation(profile)
      attestations.push(selfAttestation)
    }
    const newAttestations = await this.newAttestations(attestations)
    return await this.addAttestations(newAttestations, options)
  }

  /**
   * Loads an identity. Returns false if no identity found associated with the address.
   * @param address - User's wallet address. If not specified, use current account.
   * @return {Promise<{
   *    profile: Object,
   *    attestations: List<AttestationObject>,
   *    address: string,
   *    identityAddress: string} | false>}
   */
  async get(address) {
    const identityAddress = await this.identityAddress(address)
    if (identityAddress) {
      const userData = await this.getClaims(identityAddress)
      return Object.assign({}, userData, { address, identityAddress })
    }
    return false
  }

  /**
   * Looks up user registry for an identity. Returns identity address or false.
   * @param {string} address - User's wallet address. If not specified, uses current account.
   * @return {Promise<string|false>}
   */
  async identityAddress(address) {
    const account = await this.contractService.currentAccount()
    const userRegistry = await this.contractService.deployed(
      this.contractService.contracts[this.contractName]
    )
    address = address || account
    const result = await userRegistry.methods.users(address).call()
    if (String(result) === emptyAddress) {
      return false
    } else {
      return result
    }
  }

  /**
   * Validates a profile data and saves it as a JSON blob in IPFS.
   * @param {Object} profile - Profile data. Validates against JSON schema for profile.
   * @return {Promise<Attestation>} Attestation model object.
   */
  async profileAttestation(profile) {
    // Validate the profile data and submits it to IPFS
    const ipfsHash = await this.ipfsDataStore.save(PROFILE_DATA_TYPE, profile)
    const asBytes32 = this.contractService.getBytes32FromIpfsHash(ipfsHash)
    // For now we'll ignore issuer & signature for self attestations
    // If it's a self-attestation, then no validation is necessary
    // A signature would be an extra UI step, so we don't want to add it if not necessary
    return new AttestationObject({
      topic: selfAttestationTopic,
      data: asBytes32,
      issuer: emptyAddress,
      signature:
        '0x0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000'
    })
  }

  /**
   * Compares attestations passed in as argument with existing
   * attestations loaded from the identity contract.
   * Only returns the new attestations.
   * @param {List<AttestationObject>} attestations
   * @return {Promise<List<AttestationObject>>}
   */
  async newAttestations(attestations) {
    const identityAddress = await this.identityAddress()
    let existingAttestations = []
    if (identityAddress) {
      const claims = await this.getClaims(identityAddress)
      existingAttestations = claims.attestations
    }
    return attestations.filter(attestation => {
      const matchingAttestation = existingAttestations.filter(
        existingAttestation => {
          const topicMatches =
            attestation.topic === existingAttestation.topic
          const dataMatches = attestation.data === existingAttestation.data
          const sigMatches =
            attestation.signature === existingAttestation.signature
          return topicMatches && dataMatches && sigMatches
        }
      )
      const isNew = matchingAttestation.length === 0
      return isNew
    })
  }

  /**
   * Adds a set of attestations to the identity contract.
   * @param {List<AttestationObject>} attestations
   * @param options
   * @return {Promise<txReceipt>}
   */
  async addAttestations(attestations, options) {
    const account = await this.contractService.currentAccount()
    const userRegistry = await this.contractService.deployed(
      this.contractService.contracts[this.contractName]
    )
    const identityAddress = await this.identityAddress()
    if (attestations.length) {
      // format params for solidity methods to batch add claims
      const topics = attestations.map(({ topic }) => topic)
      const issuers = attestations.map(({ issuer }) => issuer || emptyAddress)
      const sigs =
        '0x' +
        attestations
          .map(({ signature }) => {
            return signature.substr(2)
          })
          .join('')
      const data =
        '0x' +
        attestations
          .map(({ data }) => {
            return data.substr(2)
          })
          .join('')

      /* All the data is in bytes32 binary format in the contract. To calculate the lenght we just
       * deduct 2 (becase '0x') gets removed. And then divide the remaining lenght by 2 becase
       * the data is twice the size when it is represented as string (with hex encoding).
       */
      const dataOffsets = attestations.map(({ data }) => (data.length - 2) / 2)

      if (identityAddress) {
        // batch add claims to existing identity
        const gas = 170000 + attestations.length * 230000
        return await this.contractService.call(
          'ClaimHolderRegistered',
          'addClaims',
          [topics, issuers, sigs, data, dataOffsets],
          { ...options, from: account, gas, contractAddress: identityAddress }
        )
      } else {
        // create identity with presigned claims
        const gas = 1500000 + attestations.length * 230000
        return await this.contractService.deploy(
          this.contractService.contracts.ClaimHolderPresigned,
          [
            userRegistry.options.address,
            topics,
            issuers,
            sigs,
            data,
            dataOffsets
          ],
          { from: account, gas },
          options
        )
      }
    } else if (!identityAddress) {
      // create identity
      return await this.contractService.deploy(
        this.contractService.contracts.ClaimHolderRegistered,
        [userRegistry.options.address],
        { from: account, gas: 1700000 }
      )
    }
  }

  /**
   * Loads profile and attestations.
   * @param identityAddress
   * @return {Promise<{profile: Object, attestations: List<AttestationObject>}>}
   */
  async getClaims(identityAddress) {
    const identity = await this.contractService.deployed(
      this.contractService.contracts.ClaimHolderRegistered,
      identityAddress
    )
    const claimAddedEvents = await identity.getPastEvents('ClaimAdded', {
      fromBlock: this.blockEpoch
    })

    const mapped = claimAddedEvents.map(({ returnValues, blockNumber }) => {
      return {
        claimId: returnValues.claimId,
        topic: Number(returnValues.topic),
        data: returnValues.data,
        issuer: returnValues.issuer,
        scheme: Number(returnValues.scheme),
        signature: returnValues.signature,
        uri: returnValues.uri,
        blockNumber: blockNumber
      }
    })
    const profileClaims = mapped.filter(
      ({ topic }) => topic === selfAttestationTopic
    )
    const nonProfileClaims = mapped.filter(
      ({ topic }) => topic !== selfAttestationTopic
    )
    let profile = {}
    if (profileClaims.length) {
      const bytes32 = profileClaims[profileClaims.length - 1].data
      const ipfsHash = this.contractService.getIpfsHashFromBytes32(bytes32)
      try {
        profile = await this.ipfsDataStore.load(PROFILE_DATA_TYPE, ipfsHash)
      } catch (error) {
        console.error(`Can not read profile data from ipfs (hash: '${ipfsHash}'): ${error.message}`)
      }
    }

    const validAttestations = await this.validAttestations(
      identityAddress,
      nonProfileClaims
    )

    const attestations = validAttestations
      .map(att => {
        try {
          if (ClaimDataIsIpfsHash.includes(att.topic)){
            if (att.blockNumber >= this.blockAttestattionV1)
              att.ipfsHash = this.contractService.getIpfsHashFromBytes32(att.data)
          }
        }
        catch (error) {
          console.error(`Can not convert to ipfs hash: ${error.message}`)
        }
        return att
      })
      .map(att => new AttestationObject(att))

    return { profile, attestations }
  }

  /**
   * Helper method to validate an attestation.
   * @param topic
   * @param data
   * @param signature
   * @param identityAddress
   * @return {Promise<*>}
   */
  async isValidAttestation({ topic, data, signature }, identityAddress) {
    try {
      const originIdentity = await this.contractService.deployed(
        this.contractService.contracts.OriginIdentity
      )
      const msg = Web3.utils.soliditySha3(identityAddress, topic, data)
      const prefixedMsg = this.web3EthAccounts.hashMessage(msg)
      const dataBuf = toBuffer(prefixedMsg)
      const sig = fromRpcSig(signature)
      const recovered = ecrecover(dataBuf, sig.v, sig.r, sig.s)
      const recoveredBuf = pubToAddress(recovered)
      const recoveredHex = bufferToHex(recoveredBuf)
      const hashedRecovered = Web3.utils.soliditySha3(recoveredHex)
      return await originIdentity.methods.keyHasPurpose(hashedRecovered, 3).call()
    } catch(e) {
      // validation should simply fail if there is an error
      console.error('Error during attestation validation:', e)
      return false
    }
  }

  /**
   * Helper method to filter out invalid attestations.
   * @param identityAddress
   * @param attestations
   * @return {Promise<List<AttestationObject>>}
   */
  async validAttestations(identityAddress, attestations) {
    const promiseWithValidation = attestations.map(async attestation => {
      const isValid = await this.isValidAttestation(
        attestation,
        identityAddress
      )
      return { isValid, attestation }
    })
    const withValidation = await Promise.all(promiseWithValidation)
    const filtered = withValidation.filter(({ isValid }) => isValid)
    return filtered.map(({ attestation }) => attestation)
  }
}
