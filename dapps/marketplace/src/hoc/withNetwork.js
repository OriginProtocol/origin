import React from 'react'
import { useQuery } from '@apollo/react-hooks'
import get from 'lodash/get'

import query from 'queries/Network'

function withNetwork(WrappedComponent) {
  const WithNetwork = props => {
    const { data } = useQuery(query)
    return (
      <WrappedComponent
        networkId={get(data, 'web3.networkId')}
        networkName={get(data, 'web3.networkName')}
        {...props}
      />
    )
  }
  return WithNetwork
}

export default withNetwork
