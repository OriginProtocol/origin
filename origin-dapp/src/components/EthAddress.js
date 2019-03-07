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
    return 'https://etherscan.io/address/'
  } else if (network === 'rinkeby') {
    return 'https://rinkeby.etherscan.io/address/'
  }
}

function plainAddress(address) {
  return <span className="eth-address">{address}</span>
}

const EthAddress = ({ address }) => (
  <Query query={configQuery} skip={!address}>
    {({ error, data, networkStatus }) => {
      if (networkStatus === 1 || error || !data) {
        return plainAddress(address)
      }
      const prefix = urlForNetwork(data.config)
      if (!prefix) {
        return plainAddress(address)
      }
      return (
        <a
          href={prefix + address}
          className="eth-address"
          target="_blank"
          rel="noopener noreferrer"
          onClick={e => e.stopPropagation()}
        >
          {address}
        </a>
      )
    }}
  </Query>
)

require('react-styl')(`
  .eth-address
    word-break: break-all
    line-height: normal
    font-weight: normal
`)

export default EthAddress
