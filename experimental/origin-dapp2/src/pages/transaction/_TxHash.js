import React from 'react'
import { Query } from 'react-apollo'

import gql from 'graphql-tag'

const configQuery = gql`
  query Config {
    config
  }
`

function urlForNetwork(network) {
  if (network === 'mainnet') {
    return 'https://etherscan.io/tx/'
  } else if (network === 'rinkeby') {
    return 'https://rinkeby.etherscan.io/tx/'
  }
}

const TxHash = ({ hash }) => (
  <Query query={configQuery} skip={!hash}>
    {({ error, data, networkStatus }) => {
      if (networkStatus === 1 || error || !data) {
        return hash
      }
      const prefix = urlForNetwork(data.config)
      if (!prefix) {
        return hash
      }
      return (
        <a
          target="_blank"
          rel="noopener noreferrer"
          href={prefix + hash}
          onClick={e => e.stopPropagation()}
        >
          {hash}
        </a>
      )
    }}
  </Query>
)

export default TxHash
