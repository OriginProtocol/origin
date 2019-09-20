/**
 * Don't use any of this if you can avoid it.  This is only when explicit remote
 * queries are required.  So far, this has only been necessary in one instance
 * where an internal mutation referenced an expensive internal resolver.  Use
 * of this should only be done when performanceMode is enabled and a remote
 * graphql URL has been set.
 */
import fetch from 'cross-fetch'

import context from '../contracts'

/**
 * Runs a query against the remote graphql server
 *
 * @param {string} queryString - The string graphql query to execute
 * @param {string} operationName - The OperationName to use when sending the query
 * @param {object} variables - An object with query variables
 * @returns {object} The JS object of parsed JSON from the server
 * @throws {Error} on non-200 response
 */
export default async function remoteQuery(
  queryString,
  operationName,
  variables = {}
) {
  const endpoint = `${context.graphql}/graphql`
  const resp = await fetch(`${endpoint}/graphql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      operationName,
      variables,
      query: queryString
    })
  })

  if (resp.status !== 200) {
    throw new Error('Unable to query remote graphql server')
  }

  return await resp.json()
}

export const identityQuery = `
query SkinnyIdentity($id: ID!) {
  identity(id: $id) {
    id
    firstName
    lastName
    fullName
    description
    avatarUrl
    avatarUrlExpanded
    strength
    attestations

    verifiedAttestations {
      id
      rawData
      properties {
        type
        value
      }
    }
  }
}`
