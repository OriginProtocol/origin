import ResourceBase from "../ResourceBase"
import { AttestationObject } from "./attestations"
import userSchema from '../schemas/user.json'

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
  constructor({ contractService, ipfsService }) {
    super(...arguments)
  }

  async set({ profile, attestations = [] }) {
    let account = await this.contractService.currentAccount()
    let userRegistry = await this.contractService.userRegistryContract.deployed()

    if (profile && validateUser(profile)) {
      // Submit to IPFS
      let ipfsHash = await this.ipfsService.submitFile(profile)
      let asBytes32 = this.contractService.getBytes32FromIpfsHash(ipfsHash)
      // For now we'll ignore issuer & signature for self attestations
      // If it's a self-attestation, then no validation is necessary
      // A signature would be an extra UI step, so we don't want to add it if not necessary
      let selfAttestation = new AttestationObject({
        claimType: selfAttestationClaimType,
        data: asBytes32,
        issuer: "0x0000000000000000000000000000000000000000",
        signature: "0x0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000"
      })
      attestations.push(selfAttestation)
    }

    if (attestations.length) {
      let web3 = this.contractService.web3
      let claimTypes = attestations.map(({ claimType }) => claimType)
      let issuers = attestations.map(({ issuer }) => issuer)
      let sigs = "0x" + attestations.map(({ signature }) => {
        return signature.substr(2)
      }).join("")
      let data = "0x" + attestations.map(({ data }) => {
        return web3.sha3(data).substr(2)
      }).join("")
      return await userRegistry.createUserWithClaims(
        claimTypes,
        issuers,
        sigs,
        data,
        { from: account, gas: 4000000 }
      )
    } else {
      return await userRegistry.createUser({ from: account, gas: 4000000 })
    }
  }

  async get(address) {
    let account = await this.contractService.currentAccount()
    let userRegistry = await this.contractService.userRegistryContract.deployed()
    address = address || account
    let identityAddress = await userRegistry.users(address)
    let claims = await this.getClaims(identityAddress)
    return claims
  }

  async getClaims(identityAddress) {
    let identity = this.contractService.claimHolderContract.at(identityAddress)
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
      attestations: validAttestations(nonProfileClaims)
    }
  }

  validAttestations(attestations) {
    // TODO
    return attestations
  }
}

module.exports = Users
