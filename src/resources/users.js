import ResourceBase from './_resource-base'
import { AttestationObject } from './attestations'
import userSchema from '../schemas/user.json'
import {
  fromRpcSig,
  ecrecover,
  toBuffer,
  bufferToHex,
  pubToAddress
} from 'ethereumjs-util'
import Web3 from 'web3'

const Ajv = require('ajv')
const ajv = new Ajv()

const selfAttestationClaimType = 13 // TODO: use the correct number here
const zeroAddress = '0x0000000000000000000000000000000000000000'

const validateUser = data => {
  const validate = ajv.compile(userSchema)
  if (!validate(data)) {
    throw new Error('Invalid user data')
  } else {
    return data
  }
}

class UserObject {
  constructor({ address, profile, attestations, identityAddress } = {}) {
    this.address = address
    this.profile = profile
    this.attestations = attestations
    this.identityAddress = identityAddress
  }
}

class Users extends ResourceBase {
  constructor({ contractService, ipfsService }) {
    super({ contractService, ipfsService })
    this.web3EthAccounts = this.contractService.web3.eth.accounts
  }

  async set({ profile, attestations = [] }) {
    if (profile && validateUser(profile)) {
      const selfAttestation = await this.profileAttestation(profile)
      attestations.push(selfAttestation)
    }
    const newAttestations = await this.newAttestations(attestations)
    return await this.addAttestations(newAttestations)
  }

  async get(address) {
    const identityAddress = await this.identityAddress(address)
    if (identityAddress) {
      const userData = await this.getClaims(identityAddress)
      const obj = Object.assign({}, userData, { address, identityAddress })

      return new UserObject(obj)
    }
    return new UserObject({ address })
  }

  async identityAddress(address) {
    const account = await this.contractService.currentAccount()
    const userRegistry = await this.contractService.deployed(
      this.contractService.userRegistryContract
    )
    address = address || account
    const result = await userRegistry.methods.users(address).call()
    if (String(result) === zeroAddress) {
      return false
    } else {
      return result
    }
  }

  async profileAttestation(profile) {
    // Submit to IPFS
    const ipfsHash = await this.ipfsService.submitFile(profile)
    const asBytes32 = this.contractService.getBytes32FromIpfsHash(ipfsHash)
    // For now we'll ignore issuer & signature for self attestations
    // If it's a self-attestation, then no validation is necessary
    // A signature would be an extra UI step, so we don't want to add it if not necessary
    return new AttestationObject({
      claimType: selfAttestationClaimType,
      data: asBytes32,
      issuer: '0x0000000000000000000000000000000000000000',
      signature:
        '0x0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000'
    })
  }

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
          const claimTypeMatches =
            attestation.claimType === existingAttestation.claimType
          const dataMatches = attestation.data === existingAttestation.data
          const sigMatches =
            attestation.signature === existingAttestation.signature
          return claimTypeMatches && dataMatches && sigMatches
        }
      )
      const isNew = matchingAttestation.length === 0
      return isNew
    })
  }

  async addAttestations(attestations) {
    const account = await this.contractService.currentAccount()
    const userRegistry = await this.contractService.deployed(
      this.contractService.userRegistryContract
    )
    const identityAddress = await this.identityAddress()
    if (attestations.length) {
      // format params for solidity methods to batch add claims
      const claimTypes = attestations.map(({ claimType }) => claimType)
      const issuers = attestations.map(({ issuer }) => issuer)
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
      const dataOffsets = attestations.map(() => 32) // all data hashes will be 32 bytes

      if (identityAddress) {
        // batch add claims to existing identity
        return await this.contractService.contractFn(
          this.contractService.claimHolderRegisteredContract,
          identityAddress,
          'addClaims',
          [claimTypes, issuers, sigs, data, dataOffsets],
          { from: account, gas: 4000000 }
        )
      } else {
        // create identity with presigned claims
        return await this.contractService.deploy(
          this.contractService.claimHolderPresignedContract,
          [
            userRegistry.options.address,
            claimTypes,
            issuers,
            sigs,
            data,
            dataOffsets
          ],
          { from: account, gas: 4000000 }
        )
      }
    } else if (!identityAddress) {
      // create identity
      return await this.contractService.deploy(
        this.contractService.claimHolderRegisteredContract,
        [userRegistry.options.address],
        { from: account, gas: 4000000 }
      )
    }
  }

  async getClaims(identityAddress) {
    const identity = await this.contractService.deployed(
      this.contractService.claimHolderRegisteredContract,
      identityAddress
    )
    const allEvents = await identity.getPastEvents('allEvents', {
      fromBlock: 0
    })
    const claimAddedEvents = allEvents.filter(
      ({ event }) => event === 'ClaimAdded'
    )
    const mapped = claimAddedEvents.map(({ returnValues }) => {
      return {
        claimId: returnValues.claimId,
        claimType: Number(returnValues.claimType),
        data: returnValues.data,
        issuer: returnValues.issuer,
        scheme: Number(returnValues.scheme),
        signature: returnValues.signature,
        uri: returnValues.uri
      }
    })
    const profileClaims = mapped.filter(
      ({ claimType }) => claimType === selfAttestationClaimType
    )
    const nonProfileClaims = mapped.filter(
      ({ claimType }) => claimType !== selfAttestationClaimType
    )
    let profile = {}
    if (profileClaims.length) {
      const bytes32 = profileClaims[profileClaims.length - 1].data
      const ipfsHash = this.contractService.getIpfsHashFromBytes32(bytes32)
      profile = await this.ipfsService.getFile(ipfsHash)
    }
    const validAttestations = await this.validAttestations(
      identityAddress,
      nonProfileClaims
    )
    const attestations = validAttestations.map(
      att => new AttestationObject(att)
    )
    return { profile, attestations }
  }

  async isValidAttestation({ claimType, data, signature }, identityAddress) {
    const originIdentity = await this.contractService.deployed(
      this.contractService.originIdentityContract
    )
    const msg = Web3.utils.soliditySha3(identityAddress, claimType, data)
    const prefixedMsg = this.web3EthAccounts.hashMessage(msg)
    const dataBuf = toBuffer(prefixedMsg)
    const sig = fromRpcSig(signature)
    const recovered = ecrecover(dataBuf, sig.v, sig.r, sig.s)
    const recoveredBuf = pubToAddress(recovered)
    const recoveredHex = bufferToHex(recoveredBuf)
    const hashedRecovered = Web3.utils.soliditySha3(recoveredHex)
    return await originIdentity.methods.keyHasPurpose(hashedRecovered, 3).call()
  }

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

module.exports = Users
