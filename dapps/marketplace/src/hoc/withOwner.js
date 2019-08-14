import React from 'react'
import { useQuery } from '@apollo/react-hooks'
import get from 'lodash/get'

import OwnerQuery from 'queries/Owner'

function withOwner(WrappedComponent, prop = 'id') {
  const WithOwner = props => {
    const id = get(props, prop)
    const { data } = useQuery(OwnerQuery, { skip: !id, variables: { id } })
    const owner = get(data, 'web3.account.owner.id')
    return <WrappedComponent {...props} owner={owner} />
  }
  return WithOwner
}

export default withOwner
