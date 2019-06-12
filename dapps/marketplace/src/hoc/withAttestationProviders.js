import React from 'react'
import { Query } from 'react-apollo'
import get from 'lodash/get'

import query from 'queries/AttestationProviders'

function withAttestationProviders(WrappedComponent) {
  const WithAttestationProviders = ({ ...props }) => (
    <Query query={query}>
      {({ data, networkStatus }) => {
        const attestationProviders = get(data, 'identityEvents.attestationProviders') || []
        return <WrappedComponent {...props} attestationProviders={attestationProviders} attestationProvidersLoading={networkStatus === 1} />
      }}
    </Query>
  )
  return WithAttestationProviders
}

export default withAttestationProviders
