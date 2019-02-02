import graphqlFields from 'graphql-fields'
import { getIdsForPage, getConnection } from '../_pagination'

export async function identities(contract, { first = 10, after }, context, info) {
  if (!contract) {
    return null
  }

  const fields = graphqlFields(info)

  const events = await context.identityEvents.getPastEvents({ fromBlock: 0 })

  const identities = {}
  events.forEach(event => {
    const id = event.returnValues.account
    identities[id] = identities[id] || { id }
    if (event.event === 'IdentityUpdated') {
      identities[id].ipfsHash = event.returnValues.ipfsHash
    } else if (event.event === 'IdentityDeleted') {
      identities[id].ipfsHash = null
    }
  })

  const totalCount = Object.keys(identities).length
  const allIds = Object.keys(identities)

  const { ids, start } = getIdsForPage({ after, ids: allIds, first })

  let nodes = []
  if (!fields || fields.nodes) {
    nodes = await Promise.all(ids.map(id => getIdentity(id)))
  }

  return getConnection({ start, first, nodes, ids, totalCount })
}
