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
