import React from 'react'
import { Query } from 'react-apollo'
import get from 'lodash/get'

import query from 'queries/Network'

function withNetwork(WrappedComponent) {
  const WithNetwork = props => {
    return (
      <Query query={query}>
        {({ data }) => {
          return (
            <WrappedComponent
              networkId={get(data, 'web3.networkId')}
              networkName={get(data, 'web3.networkName')}
              {...props}
            />
          )
        }}
      </Query>
    )
  }
  return WithNetwork
}

export default withNetwork
