import React, { Component } from 'react'
import { Query } from 'react-apollo'

import { Button } from '@blueprintjs/core'

import BottomScrollListener from 'components/BottomScrollListener'
import LoadingSpinner from 'components/LoadingSpinner'
import nextPageFactory from 'utils/nextPageFactory'

import ListingsList from '../listings/_ListingsList'

import query from 'queries/UserListings'

const nextPage = nextPageFactory('marketplace.user.listings')

class UserListings extends Component {
  render() {
    const vars = { first: 15, id: this.props.userId }

    return (
      <Query query={query} variables={vars} notifyOnNetworkStatusChange={true}>
        {({ error, data, fetchMore, networkStatus }) => {
          if (networkStatus === 1) {
            return <LoadingSpinner />
          } else if (!data || !data.marketplace) {
            return <p className="p-3">No marketplace contract?</p>
          } else if (error) {
            return <p className="p-3">Error :(</p>
          }

          const { nodes, pageInfo } = data.marketplace.user.listings
          const { hasNextPage, endCursor: after } = pageInfo

          return (
            <BottomScrollListener
              ready={networkStatus === 7}
              hasMore={hasNextPage}
              onBottom={() => nextPage(fetchMore, { ...vars, after })}
            >
              <>
                <ListingsList listings={nodes} />
                {!hasNextPage ? null : (
                  <Button
                    text="Load more..."
                    loading={networkStatus === 3}
                    className="mt-3"
                    onClick={() => nextPage(fetchMore, { ...vars, after })}
                  />
                )}
              </>
            </BottomScrollListener>
          )
        }}
      </Query>
    )
  }
}

export default UserListings
