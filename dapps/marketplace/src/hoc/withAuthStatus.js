import React from 'react'
import { useQuery } from '@apollo/react-hooks'
import get from 'lodash/get'

import AuthStatusQuery from 'queries/AuthStatus'

function withAuthStatus(WrappedComponent) {
  const WithAuthStatus = props => {
    const { data, error, networkStatus, refetch } = useQuery(AuthStatusQuery, {
      fetchPolicy: 'network-only',
      notifyOnNetworkStatusChange: true,
      variables: {
        wallet: props.wallet
      },
      skip: props.walletLoading || !props.wallet,
      pollInterval: 1000
    })

    if (error) console.error(error)

    return (
      <WrappedComponent
        {...props}
        isLoggedIn={get(data, 'isLoggedIn', false)}
        isAuthTokenValid={get(data, 'tokenStatus.valid', false)}
        hasAuthTokenExpired={get(data, 'tokenStatus.expired', false)}
        willAuthTokenExpire={get(data, 'tokenStatus.willExpire', false)}
        authStatusRefetch={refetch}
        authStatusLoading={networkStatus === 1}
      />
    )
  }
  return WithAuthStatus
}

export default withAuthStatus
