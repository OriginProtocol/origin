import React from 'react'
import { Query } from 'react-apollo'
import get from 'lodash/get'

import Web3Query from 'queries/Web3'

function withWeb3(WrappedComponent) {
  const WithWeb3 = props => {
    return (
      <Query query={Web3Query}>
        {({ data, networkStatus }) => {
          const web3 = get(data, 'web3', {})
          return (
            <WrappedComponent
              {...props}
              web3={web3}
              web3Loading={networkStatus === 1}
            />
          )
        }}
      </Query>
    )
  }
  return WithWeb3
}

export default withWeb3
