import React from 'react'
import { Query } from 'react-apollo'
import get from 'lodash/get'

import OwnerQuery from 'queries/Owner'

function withOwner(WrappedComponent, prop = 'id') {
  const WithOwner = props => {
    const id = get(props, prop)
    return (
      <Query query={OwnerQuery} skip={!id} variables={{ id }}>
        {({ data }) => {
          const owner = get(data, 'web3.account.owner.id')
          return <WrappedComponent {...props} owner={owner} />
        }}
      </Query>
    )
  }
  return WithOwner
}

export default withOwner
