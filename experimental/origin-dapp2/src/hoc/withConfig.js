import React from 'react'
import { Query } from 'react-apollo'
import get from 'lodash/get'

import ConfigQuery from 'queries/Config'

function withConfig(WrappedComponent) {
  const WithConfig = props => {
    return (
      <Query query={ConfigQuery}>
        {({ data, networkStatus, refetch }) => {
          const config = get(data, 'configObj', {})
          return (
            <WrappedComponent
              {...props}
              config={config}
              configLoading={networkStatus === 1}
              configRefetch={refetch}
            />
          )
        }}
      </Query>
    )
  }
  return WithConfig
}

export default withConfig
