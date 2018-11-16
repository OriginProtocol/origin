import { get } from '../utils/ipfsHash'
import contracts from '../contracts'

export default {
  claims: (identity) =>
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
      fromBlock: contracts.EventBlock,
      filter: { topic: '13'}
    })

    if (!claims.length) { return null }

    const claim = claims[claims.length - 1]
    const ipfsHash = claim.returnValues.data

    let data
    try {
      data = await get(contracts.ipfsGateway, ipfsHash)
    } catch (e) {
      return null
    }
    return { ...data, id: ipfsHash }
  }
}
