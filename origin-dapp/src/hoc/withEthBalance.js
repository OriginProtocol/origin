import React from 'react'
import { Query } from 'react-apollo'
import get from 'lodash/get'

import query from 'queries/Balance'

function withEthBalance(WrappedComponent) {
  const WithEthBalance = props => (
    <Query query={query}>
      {({ data }) => (
        <WrappedComponent
          {...props}
          ethBalance={get(data, 'web3.primaryAccount.balance.eth')}
        />
      )}
    </Query>
  )
  return WithEthBalance
}

export default withEthBalance
