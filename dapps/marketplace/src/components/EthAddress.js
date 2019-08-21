import React from 'react'
import { useQuery } from '@apollo/react-hooks'

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

const EthAddress = ({ address, short }) => {
  if (!address) {
    return null
  }

  const { error, data, networkStatus } = useQuery(configQuery, {
    skip: !address
  })

  const addressToShow = short
    ? `${address.slice(0, 4)}...${address.slice(-4)}`
    : address

  if (networkStatus === 1 || error || !data) {
    return plainAddress(addressToShow)
  }
  const prefix = urlForNetwork(data.config)
  if (!prefix) {
    return plainAddress(addressToShow)
  }
  return (
    <a
      href={prefix + address}
      className="eth-address"
      target="_blank"
      rel="noopener noreferrer"
      onClick={e => e.stopPropagation()}
    >
      {addressToShow}
    </a>
  )
}

require('react-styl')(`
  .eth-address
    word-break: break-all
    line-height: normal
    font-weight: normal
`)

export default EthAddress
