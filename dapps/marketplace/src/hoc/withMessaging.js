import React from 'react'
import { useQuery } from '@apollo/react-hooks'

import query from 'queries/Conversations'

function withMessaging(WrappedComponent) {
  const withMessaging = props => {
    const { error, data, loading } = useQuery(query)
    if (error) console.error(error)

    return (
      <WrappedComponent
        {...props}
        messaging={data ? data.messaging : null}
        messagingError={error}
        messagingLoading={loading}
      />
    )
  }
  return withMessaging
}

export default withMessaging
