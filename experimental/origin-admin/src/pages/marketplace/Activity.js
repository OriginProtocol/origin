import React from 'react'

import { Button, Spinner } from '@blueprintjs/core'
import { Query } from 'react-apollo'
import EventsTable from './_EventsTable'
import BottomScrollListener from 'components/BottomScrollListener'

import query from './queries/events'

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
          return (
            <div style={{ maxWidth: 300, marginTop: 100 }}>
              <Spinner />
            </div>
          )
        }
        if (!data || !data.marketplace)
          return <p className="p-3">No marketplace contract?</p>
        if (error) {
          console.log(error)
          return <p>Error :(</p>
        }
        const numEvents = data.marketplace.events.length

        return (
          <BottomScrollListener
            initial={
              numEvents < data.marketplace.totalEvents && networkStatus !== 3
            }
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
