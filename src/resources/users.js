import ResourceBase from "../ResourceBase"
import { AttestationObject } from "./attestations"
import userSchema from "../schemas/user.json"
import {
  fromRpcSig,
  ecrecover,
  toBuffer,
  bufferToHex,
  pubToAddress
} from "ethereumjs-util"
import web3Utils from "web3-utils" // not necessary with web3 1.0
import Web3EthAccounts from "web3-eth-accounts" // not necessary with web3 1.0

var Ajv = require('ajv')
var ajv = new Ajv()

const selfAttestationClaimType = 13 // TODO: use the correct number here
const zeroAddress = "0x0000000000000000000000000000000000000000"

let validateUser = (data) => {
  let validate = ajv.compile(userSchema)
  if (!validate(data)) {
    throw new Error('Invalid user data')
  } else {
    return data
  }
}

class Users extends ResourceBase {
  constructor({ contractService, ipfsService }) {
    super({ contractService, ipfsService })
    this.web3EthAccounts = new Web3EthAccounts()
  }

  async set({ profile, attestations = [] }) {
    if (profile && validateUser(profile)) {
      let selfAttestation = await this.profileAttestation(profile)
      attestations.push(selfAttestation)
    }
    let newAttestations = await this.newAttestations(attestations)
    this.addAttestations(newAttestations)
  }

  async get(address) {
    let identityAddress = await this.identityAddress(address)
    if (identityAddress) {
      return await this.getClaims(identityAddress)
    }
    return []
  }

  async identityAddress(address) {
    let account = await this.contractService.currentAccount()
    let userRegistry = await this.contractService.userRegistryContract.deployed()
    address = address || account
    let result = await userRegistry.users(address)
    if (String(result) === zeroAddress) {
    } else {
      return result
    }
  }

  async profileAttestation(profile) {
    // Submit to IPFS
    let ipfsHash = await this.ipfsService.submitFile(profile)
    let asBytes32 = this.contractService.getBytes32FromIpfsHash(ipfsHash)
    // For now we'll ignore issuer & signature for self attestations
    // If it's a self-attestation, then no validation is necessary
    // A signature would be an extra UI step, so we don't want to add it if not necessary
    return new AttestationObject({
      claimType: selfAttestationClaimType,
      data: asBytes32,
      issuer: "0x0000000000000000000000000000000000000000",
      signature: "0x0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000"
    })
  }

  async newAttestations(attestations) {
    let identityAddress = await this.identityAddress()
    let existingAttestations = []
    if (identityAddress) {
      let claims = await this.getClaims(identityAddress)
      existingAttestations = claims.attestations
    }
    return attestations.filter((attestation) => {
      let matchingAttestation = existingAttestations.filter((existingAttestation) => {
        let claimTypeMatches = attestation.claimType === existingAttestation.claimType
        let dataMatches = attestation.data === existingAttestation.data
        let sigMatches = attestation.signature === existingAttestation.signature
        return claimTypeMatches || dataMatches || sigMatches
      })
      let isNew = matchingAttestation.length === 0
      return isNew
    })
  }

  async addAttestations(attestations) {
    let account = await this.contractService.currentAccount()
    let userRegistry = await this.contractService.userRegistryContract.deployed()
    let identityAddress = await this.identityAddress()
    if (attestations.length) {
      // format params for solidity methods to batch add claims
      let claimTypes = attestations.map(({ claimType }) => claimType)
      let issuers = attestations.map(({ issuer }) => issuer)
      let sigs = "0x" + attestations.map(({ signature }) => {
        return signature.substr(2)
      }).join("")
      let data = "0x" + attestations.map(({ data }) => {
        return data.substr(2)
      }).join("")
      let dataOffsets = attestations.map(() => 32) // all data hashes will be 32 bytes

      if (identityAddress) {
        // batch add claims to existing identity
        let claimHolder = await this.contractService.claimHolderRegisteredContract.at(identityAddress)
        return await claimHolder.addClaims(
          claimTypes,
          issuers,
          sigs,
          data,
          { from: account, gas: 4000000 }
        )
      } else {
        // create identity with presigned claims
        return await this.contractService.claimHolderPresignedContract.new(
          userRegistry.address,
          claimTypes,
          issuers,
          sigs,
          data,
          dataOffsets,
          { from: account, gas: 4000000 }
        )
      }
    } else if (!identityAddress) {
      // create identity
      return await this.contractService.claimHolderRegisteredContract.new(
        userRegistry.address,
        { from: account, gas: 4000000 }
      )
    }
  }

  async getClaims(identityAddress) {
    let identity = this.contractService.claimHolderRegisteredContract.at(identityAddress)
    let allEvents = identity.allEvents({fromBlock: 0, toBlock: 'latest'})
    let claims = await new Promise((resolve, reject) => {
      allEvents.get((err, events) => {
        let claimAddedEvents = events.filter(({ event }) => event === "ClaimAdded" )
        let mapped = claimAddedEvents.map(({ args }) => {
          return {
            claimId: args.claimId,
            claimType: args.claimType.toNumber(),
            data: args.data,
            issuer: args.issuer,
            scheme: args.scheme.toNumber(),
            signature: args.signature,
            uri: args.uri
          }
        })
        resolve(mapped)
      })
    })
    let profileClaims = claims.filter(({ claimType }) => claimType === selfAttestationClaimType )
    let nonProfileClaims = claims.filter(({ claimType }) => claimType !== selfAttestationClaimType )
    let profile = {}
    if (profileClaims.length) {
      let bytes32 = profileClaims[profileClaims.length - 1].data
      let ipfsHash = this.contractService.getIpfsHashFromBytes32(bytes32)
      profile = await this.ipfsService.getFile(ipfsHash)
    }
    let validAttestations = await this.validAttestations(identityAddress, nonProfileClaims)
    let attestations = validAttestations.map(att => new AttestationObject(att))
    return { profile, attestations }
  }

  async validAttestations(identityAddress, attestations) {
    let originIdentity = await this.contractService.originIdentityContract.deployed()
    return attestations.filter(async ({ claimType, issuer, data, signature }) => {
      let msg = web3Utils.soliditySha3(identityAddress, claimType, data)
      let prefixedMsg = this.web3EthAccounts.hashMessage(msg)
      let dataBuf = toBuffer(prefixedMsg)
      let sig = fromRpcSig(signature)
      let recovered = ecrecover(dataBuf, sig.v, sig.r, sig.s)
      let recoveredBuf = pubToAddress(recovered)
      let recoveredHex = bufferToHex(recoveredBuf)
      let hashedRecovered = web3Utils.soliditySha3(recoveredHex)
      return await originIdentity.keyHasPurpose(hashedRecovered, 3)
    })
  }
}

module.exports = Users
