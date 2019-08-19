import React from 'react'
import { useQuery } from '@apollo/react-hooks'
import get from 'lodash/get'

import Web3Query from 'queries/Web3'

function withWeb3(WrappedComponent) {
  const WithWeb3 = props => {
    const { data, networkStatus } = useQuery(Web3Query)
    const web3 = get(data, 'web3', {})
    return (
      <WrappedComponent
        {...props}
        web3={web3}
        web3Loading={networkStatus === 1}
      />
    )
  }
  return WithWeb3
}

export default withWeb3
