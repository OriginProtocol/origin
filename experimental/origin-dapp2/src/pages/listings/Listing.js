import React, { Component } from 'react'
import { Query } from 'react-apollo'
import { Switch, Route } from 'react-router-dom'
import get from 'lodash/get'

import ListingQuery from 'queries/Listing'
import ListingDetail from './ListingDetail'
import Onboard from '../onboard/Onboard'

class Listing extends Component {
  state = { quantity: '1' }

  render() {
    const listingId = this.props.match.params.listingID

    return (
      <Query query={ListingQuery} variables={{ listingId }}>
        {({ networkStatus, error, data }) => {
          if (networkStatus === 1) {
            return <div>Loading...</div>
          } else if (error) {
            return <div>Error...</div>
          } else if (!data || !data.marketplace) {
            return <div>No marketplace contract?</div>
          }

          const listing = data.marketplace.listing
          if (!listing) {
            return <div>Listing not found</div>
          }
          const from = get(data, 'web3.metaMaskAccount.id')

          return (
            <Switch>
              <Route
                path="/listings/:listingID/onboard"
                render={() => (
                  <Onboard listing={listing} quantity={this.state.quantity} />
                )}
              />
              <Route
                render={() => (
                  <ListingDetail
                    listing={listing}
                    from={from}
                    quantity={this.state.quantity}
                    updateQuantity={quantity => this.setState({ quantity })}
                  />
                )}
              />
            </Switch>
          )
        }}
      </Query>
    )
  }
}

export default Listing
