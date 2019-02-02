import { get } from 'origin-ipfs'
import contracts from '../contracts'

// Topics:
//   3: facebook
//   4: twitter
//   5: airbnb
//   10: phone
//   11: email
//   13: self attestation

const progressPct = {
  firstName: 10,
  lastName: 10,
  description: 10,
  avatar: 10,

  emailVerified: 15,
  phoneVerified: 15,
  facebookVerified: 10,
  twitterVerified: 10,
  airbnbVerified: 10
}

export default {
  // claims: identity =>
  //   new Promise(async resolve => {
  //     const contract = contracts.claimHolderRegistered
  //     contract.options.address = identity.id
  //
  //     const claims = await contract.getPastEvents('ClaimAdded', {
  //       fromBlock: contracts.EventBlock
  //     })
  //
  //     resolve(
  //       claims.map(c => {
  //         const {
  //           claimId,
  //           data,
  //           issuer,
  //           scheme,
  //           signature,
  //           topic,
  //           uri
  //         } = c.returnValues
  //
  //         return {
  //           id: claimId,
  //           data,
  //           issuer,
  //           scheme,
  //           signature,
  //           topic,
  //           uri
  //         }
  //       })
  //     )
  //   }),
  // profile: async function(identity) {
  //   if (identity.id.indexOf('0x0000') === 0) return null
  //
  //   const contract = contracts.claimHolderRegistered
  //   contract.options.address = identity.id
  //
  //   const claims = await contract.getPastEvents('ClaimAdded', {
  //     fromBlock: contracts.EventBlock
  //   })
  //
  //   if (!claims.length) {
  //     return null
  //   }
  //   let profileIpfsHash
  //   const profile = {
  //     facebookVerified: false,
  //     twitterVerified: false,
  //     airbnbVerified: false,
  //     phoneVerified: false,
  //     emailVerified: false
  //   }
  //
  //   claims.forEach(claim => {
  //     if (claim.returnValues.topic === '13') {
  //       profileIpfsHash = claim.returnValues.data
  //     }
  //     if (claim.returnValues.topic === '3') {
  //       profile.facebookVerified = true
  //     } else if (claim.returnValues.topic === '4') {
  //       profile.twitterVerified = true
  //     } else if (claim.returnValues.topic === '5') {
  //       profile.airbnbVerified = true
  //     } else if (claim.returnValues.topic === '10') {
  //       profile.phoneVerified = true
  //     } else if (claim.returnValues.topic === '11') {
  //       profile.emailVerified = true
  //     }
  //   })
  //
  //   let data
  //   try {
  //     data = await get(contracts.ipfsGateway, profileIpfsHash)
  //     data.fullName = data.firstName
  //     if (data.lastName) {
  //       data.fullName += ` ${data.lastName}`
  //     }
  //   } catch (e) {
  //     return null
  //   }
  //
  //   let strength = 0
  //   Object.keys(progressPct).forEach(key => {
  //     if (data[key] || profile[key]) {
  //       strength += progressPct[key]
  //     }
  //   })
  //
  //   return {
  //     ...data,
  //     id: profileIpfsHash,
  //     ...profile,
  //     strength
  //   }
  // }
}
