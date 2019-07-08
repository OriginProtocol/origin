import React from 'react'
import { Query } from 'react-apollo'

import query from 'queries/Conversations'

function withMessaging(WrappedComponent) {
  const withMessaging = props => {
    return (
      <Query query={query} pollInterval={500}>
        {({ error, data, loading }) => {
          if (error) console.error(error)

          return (
            <WrappedComponent
              {...props}
              messaging={data ? data.messaging : null}
              messagingError={error}
              messagingLoading={loading}
            />
          )
        }}
      </Query>
    )
  }
  return withMessaging
}

export default withMessaging
