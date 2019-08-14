import React from 'react'
import { useQuery } from '@apollo/react-hooks'
import get from 'lodash/get'

import AttestationProviders from 'queries/AttestationProviders'

function withAttestationProviders(WrappedComponent) {
  const WithAttestationProviders = ({ ...props }) => {
    const { data, networkStatus } = useQuery(AttestationProviders)
    const attestationProviders =
      get(data, 'identityEvents.attestationProviders') || []
    return (
      <WrappedComponent
        {...props}
        attestationProviders={attestationProviders}
        attestationProvidersLoading={networkStatus === 1}
      />
    )
  }
  return WithAttestationProviders
}

export default withAttestationProviders
