import React, { Component } from 'react'
import { Query } from 'react-apollo'

import gql from 'graphql-tag'

const configQuery = gql`
  query Config {
    config
  }
`

function urlForNetwork (network){
  if(network == "mainnet") {
    return "https://etherscan.io/address/"
  } else if(network == "rinkeby") {
    return "https://rinkeby.etherscan.io/address/"
  }
}

function plainAddress(address) {
    return <span className="eth-address">{address}</span>
}

class EthAddress extends Component {
  render() {
      const address = this.props.address
      if(address == undefined){
          return
      }
      return <Query query={configQuery}>
        {({ error, data, networkStatus }) => {
          if (networkStatus === 1) {
            return plainAddress(address)
          } else if (error) {
            return plainAddress(address)
          }
          const prefix = urlForNetwork(data.config)
          if(prefix == undefined){
            return plainAddress(address)
          }
          return <a href={prefix + address} className="eth-address">{address}</a>
        }}
      </Query>
  }
}

require('react-styl')(`
  .eth-address
    word-break: break-all
    line-height: normal
`)

export default EthAddress