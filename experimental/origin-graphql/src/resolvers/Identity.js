import { get } from 'origin-ipfs'
import contracts from '../contracts'

// Topics:
//   3: facebook
//   4: twitter
//   5: airbnb
//   10: phone
//   11: email
//   13: self attestation

export default {
  claims: identity =>
    new Promise(async resolve => {
      const contract = contracts.claimHolderRegistered
      contract.options.address = identity.id

      const claims = await contract.getPastEvents('ClaimAdded', {
        fromBlock: contracts.EventBlock
      })

      resolve(
        claims.map(c => {
          const {
            claimId,
            data,
            issuer,
            scheme,
            signature,
            topic,
            uri
          } = c.returnValues

          return {
            id: claimId,
            data,
            issuer,
            scheme,
            signature,
            topic,
            uri
          }
        })
      )
    }),
  profile: async function(identity) {
    if (identity.id.indexOf('0x0000') === 0) return null

    const contract = contracts.claimHolderRegistered
    contract.options.address = identity.id

    const claims = await contract.getPastEvents('ClaimAdded', {
      fromBlock: contracts.EventBlock
    })

    if (!claims.length) {
      return null
    }
    let profileIpfsHash
    const profile = {
      facebookVerified: false,
      twitterVerified: false,
      airbnbVerified: false,
      phoneVerified: false,
      emailVerified: false,
      strength: '10%'
    }
    claims.forEach(claim => {
      // console.log(claim)
      if (claim.returnValues.topic === '13') {
        profileIpfsHash = claim.returnValues.data
      }
      if (claim.returnValues.topic === '3') {
        profile.facebookVerified = true
      } else if (claim.returnValues.topic === '4') {
        profile.twitterVerified = true
      } else if (claim.returnValues.topic === '5') {
        profile.airbnbVerified = true
      } else if (claim.returnValues.topic === '10') {
        profile.phoneVerified = true
      } else if (claim.returnValues.topic === '11') {
        profile.emailVerified = true
      }
    })

    let data
    try {
      data = await get(contracts.ipfsGateway, profileIpfsHash)
    } catch (e) {
      return null
    }
    return { ...data, id: profileIpfsHash, ...profile }
  }
}
