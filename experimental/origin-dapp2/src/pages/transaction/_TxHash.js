import React, { Component } from 'react'
import { Query } from 'react-apollo'

import gql from 'graphql-tag'

const configQuery = gql`
  query Config {
    config
  }
`

function urlForNetwork (network){
  if(network == 'mainnet') {
    return 'https://etherscan.io/tx/'
  } else if(network == 'rinkeby') {
    return 'https://rinkeby.etherscan.io/tx/'
  }
}

class TxHash extends Component {
  render() {
      const hash = this.props.hash
      if(hash == undefined){
          return
      }
      return <Query query={configQuery}>
        {({ error, data, networkStatus }) => {
          if (networkStatus === 1) {
            return <span>{hash}</span>
          } else if (error) {
            return <span>{hash}</span>
          }
          const prefix = urlForNetwork(data.config)
          if(prefix == undefined){
            return <span>{hash}</span>
          }
          return <a href={prefix + hash}>{hash}</a>
        }}
      </Query>
  }
}

export default TxHash