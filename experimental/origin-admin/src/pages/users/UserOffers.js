import React, { Component } from 'react'
import { Query } from 'react-apollo'

import { Button } from '@blueprintjs/core'

import BottomScrollListener from 'components/BottomScrollListener'
import LoadingSpinner from 'components/LoadingSpinner'
import nextPageFactory from 'utils/nextPageFactory'

import query from 'queries/UserOffers'

const nextPage = nextPageFactory('marketplace.user.offers')

class UserOffers extends Component {
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

          const { nodes, pageInfo } = data.marketplace.user.offers
          const { hasNextPage, endCursor: after } = pageInfo

          return (
            <BottomScrollListener
              ready={networkStatus === 7}
              hasMore={hasNextPage}
              onBottom={() => nextPage(fetchMore, { ...vars, after })}
            >
              <>
                <table className="bp3-html-table bp3-small bp3-html-table-bordered">
                  <thead>
                    <tr>
                      <th>Listing</th>
                      <th>Offer</th>
                      <th>Title</th>
                    </tr>
                  </thead>
                  <tbody>
                    {nodes.map(offer => (
                      <tr key={`${offer.listing.id}-${offer.id}`}>
                        <td>{offer.listingId}</td>
                        <td>{offer.offerId}</td>
                        <td>{offer.listing.title}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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

export default UserOffers
