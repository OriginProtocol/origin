import React from 'react'

import { Button } from '@blueprintjs/core'
import { Query } from 'react-apollo'
import EventsTable from './_EventsTable'
import BottomScrollListener from 'components/BottomScrollListener'
import LoadingSpinner from 'components/LoadingSpinner'
import QueryError from 'components/QueryError'

import query from 'queries/AllEvents'

let lastFetched = 0
function nextPage(fetchMore, numEvents) {
  if (numEvents === lastFetched) return
  lastFetched = numEvents
  fetchMore({
    variables: {
      offset: numEvents,
      limit: 10
    },
    updateQuery: (prev, { fetchMoreResult }) => {
      if (!fetchMoreResult) return prev
      return {
        marketplace: {
          ...prev.marketplace,
          events: [
            ...prev.marketplace.events,
            ...fetchMoreResult.marketplace.events
          ]
        }
      }
    }
  })
}

const Events = () => (
  <div className="mt-3">
    <Query
      query={query}
      variables={{ offset: 0, limit: 20 }}
      notifyOnNetworkStatusChange={true}
    >
      {({ data, error, fetchMore, networkStatus }) => {
        if (networkStatus === 1) {
          return <LoadingSpinner />
        } else if (error) {
          return <QueryError error={error} query={query} />
        } else if (!data || !data.marketplace) {
          return 'No marketplace contract?'
        }

        const numEvents = data.marketplace.events.length

        return (
          <BottomScrollListener
            ready={networkStatus !== 3}
            hasMore={numEvents < data.marketplace.totalEvents}
            onBottom={() => nextPage(fetchMore, numEvents)}
          >
            <div className="ml-3">
              <EventsTable events={data.marketplace.events} />
              {numEvents >= data.marketplace.totalEvents ? null : (
                <Button
                  text="Load more..."
                  loading={networkStatus === 3}
                  className="mt-3"
                  onClick={() => nextPage(fetchMore, numEvents)}
                />
              )}
            </div>
          </BottomScrollListener>
        )
      }}
    </Query>
  </div>
)

export default Events
