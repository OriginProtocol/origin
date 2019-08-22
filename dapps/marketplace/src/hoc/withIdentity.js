import React from 'react'
import { useQuery } from '@apollo/react-hooks'
import get from 'lodash/get'

import IdentityQuery from 'queries/SkinnyIdentity'

function withIdentity(WrappedComponent, walletProp = 'walletProxy') {
  const WithIdentity = props => {
    const id = get(props, walletProp)
    const { data, networkStatus, refetch } = useQuery(IdentityQuery, {
      skip: !id,
      variables: { id }
    })
    const identity = get(data, 'identity')
    return (
      <WrappedComponent
        {...props}
        identity={identity}
        identityLoading={networkStatus === 1}
        identityLoaded={networkStatus >= 7}
        identityRefetch={refetch}
      />
    )
  }
  return WithIdentity
}

export default withIdentity
