import React from 'react'
import { Query } from 'react-apollo'
import get from 'lodash/get'

import query from 'queries/AccountBalance'

function withEthBalance(WrappedComponent) {
  const WithEthBalance = props => (
    <Query query={query} variables={{ id: props.wallet }} skip={!props.wallet}>
      {({ data }) => (
        <WrappedComponent
          {...props}
          ethBalance={get(data, 'web3.account.balance.eth')}
        />
      )}
    </Query>
  )
  return WithEthBalance
}

export default withEthBalance
