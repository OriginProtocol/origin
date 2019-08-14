import React from 'react'
import { useQuery } from '@apollo/react-hooks'
import get from 'lodash/get'

import query from 'queries/AccountBalance'

function withEthBalance(WrappedComponent) {
  const WithEthBalance = props => {
    const { data } = useQuery(query, {
      variables: { id: props.wallet },
      skip: !props.wallet
    })
    return (
      <WrappedComponent
        {...props}
        ethBalance={get(data, 'web3.account.balance.eth')}
      />
    )
  }
  return WithEthBalance
}

export default withEthBalance
