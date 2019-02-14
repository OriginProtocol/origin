import React from 'react'
import { Query } from 'react-apollo'
import get from 'lodash/get'

import query from 'queries/TokenBalance'

function withTokens(WrappedComponent) {
  const WithTokens = (props) => (
    <Query
      query={query}
      variables={{ account: props.wallet, token: props.token, currency: props.currency }}
    >
      {({ data, error }) => {
        const exchangeRate = get(data, 'web3.account.token.token.exchangeRate', '')
        return(
          <WrappedComponent
            {...props}
            exchangeRate={exchangeRate}
          />
        )
      }}
    </Query>
  )
  return WithTokens
}

export default withTokens
