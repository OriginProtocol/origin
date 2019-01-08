import React from 'react'
import { Query } from 'react-apollo'
import get from 'lodash/get'

import IdentityQuery from 'queries/Identity'

function withIdentity(WrappedComponent) {
  const WithIdentity = props => {
    if (!props.wallet) {
      return <WrappedComponent {...props} />
    }
    return (
      <Query query={IdentityQuery} variables={{ id: props.wallet }}>
        {({ data, networkStatus }) => {
          const identity = get(data, 'web3.account.identity')
          return (
            <WrappedComponent
              {...props}
              identity={identity}
              identityLoading={networkStatus === 1}
            />
          )
        }}
      </Query>
    )
  }
  return WithIdentity
}

export default withIdentity
