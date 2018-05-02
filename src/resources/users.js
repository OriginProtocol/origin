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

let validateUser = (data) => {
  let validate = ajv.compile(userSchema)
  if (!validate(data)) {
    throw new Error('Invalid user data')
  } else {
    return data
  }
}

class Users extends ResourceBase {
  constructor({ contractService, ipfsService, issuer }) {
    super({ contractService, ipfsService })
    this.issuer = issuer
    this.web3EthAccounts = new Web3EthAccounts()
  }

  async set({ profile, attestations = [] }) {
    if (profile && validateUser(profile)) {
      let selfAttestation = await this.profileAttestation(profile)
      attestations.push(selfAttestation)
    }
    this.addAttestations(attestations)
  }

  async get(address) {
    let account = await this.contractService.currentAccount()
    let userRegistry = await this.contractService.userRegistryContract.deployed()
    address = address || account
    let identityAddress = await userRegistry.users(address)
    let claims = await this.getClaims(identityAddress)
    return claims
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

  async addAttestations(attestations) {
    let account = await this.contractService.currentAccount()
    let userRegistry = await this.contractService.userRegistryContract.deployed()
    if (attestations.length) {
      // format params for solidity methods to batch add claims
      let identityAddress = await userRegistry.users(account)
      let hasRegisteredIdentity = identityAddress !== "0x0000000000000000000000000000000000000000"
      let claimTypes = attestations.map(({ claimType }) => claimType)
      let issuers = attestations.map(({ issuer }) => issuer)
      let sigs = "0x" + attestations.map(({ signature }) => {
        return signature.substr(2)
      }).join("")
      let data = "0x" + attestations.map(({ data }) => {
        let hashed = (data.substr(0, 2) === "0x") ? data : web3Utils.sha3(data)
        return hashed.substr(2)
      }).join("")
      let dataOffsets = attestations.map(() => 32) // all data hashes will be 32 bytes

      if (hasRegisteredIdentity) {
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
    } else if (!hasRegisteredIdentity) {
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
      let bytes32 = profileClaims[0].data
      let ipfsHash = this.contractService.getIpfsHashFromBytes32(bytes32)
      profile = await this.ipfsService.getFile(ipfsHash)
    }
    return {
      profile,
      attestations: this.validAttestations(identityAddress, nonProfileClaims)
    }
  }

  validAttestations(identityAddress, attestations) {
    return attestations.filter(({ claimType, issuer, data, signature }) => {
      if (issuer.toLowerCase() !== this.issuer.toLowerCase()) {
        // TODO: we should be checking that issuer has key purpose on a master origin identity contract
        // (rather than hard-coding a single issuer)
        return false
      }
      let msg = web3Utils.soliditySha3(identityAddress, claimType, data)
      let prefixedMsg = this.web3EthAccounts.hashMessage(msg)
      let dataBuf = toBuffer(prefixedMsg)
      let sig = fromRpcSig(signature)
      let recovered = ecrecover(dataBuf, sig.v, sig.r, sig.s)
      let recoveredBuf = pubToAddress(recovered)
      let recoveredHex = bufferToHex(recoveredBuf)
      let hashedRecovered = web3Utils.soliditySha3(recoveredHex)
      return recoveredHex.toLowerCase() === issuer.toLowerCase()
    })
  }
}

module.exports = Users
