import React from 'react'
import { Query } from 'react-apollo'
import get from 'lodash/get'

import ConfigQuery from 'queries/Config'

function withConfig(WrappedComponent, prop = 'config') {
  const WithConfig = ({ ...props }) => (
    <Query query={ConfigQuery}>
      {({ data, networkStatus }) => {
        props[prop] = get(data, 'configObj') || {}
        props[`${prop}Loading`] = networkStatus === 1
        return <WrappedComponent {...props} />
      }}
    </Query>
  )
  return WithConfig
}

export default withConfig
