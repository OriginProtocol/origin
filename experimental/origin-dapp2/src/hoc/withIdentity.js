import React from 'react'
import { Query } from 'react-apollo'
import get from 'lodash/get'

import IdentityQuery from 'queries/Identity'

function withIdentity(WrappedComponent, walletProp = 'wallet') {
  const WithIdentity = props => {
    const id = get(props, walletProp)
    if (!id) {
      return <WrappedComponent {...props} />
    }
    return (
      <Query query={IdentityQuery} variables={{ id }}>
        {({ data, networkStatus, refetch }) => {
          const identity = get(data, 'web3.account.identity')
          return (
            <WrappedComponent
              {...props}
              identity={identity}
              identityLoading={networkStatus === 1}
              identityRefetch={refetch}
            />
          )
        }}
      </Query>
    )
  }
  return WithIdentity
}

export default withIdentity
