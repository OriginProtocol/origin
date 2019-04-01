import React, { Component } from 'react'
import { Query } from 'react-apollo'
import { Switch, Route } from 'react-router-dom'
import get from 'lodash/get'
import { fbt } from 'fbt-runtime'

import QueryError from 'components/QueryError'
import DocumentTitle from 'components/DocumentTitle'
import LoadingSpinner from 'components/LoadingSpinner'
import Redirect from 'components/Redirect'

import query from 'queries/Listing'
import ListingDetail from './ListingDetail'
import EditListing from './Edit'
import Onboard from '../onboard/Onboard'

class Listing extends Component {
  state = { quantity: '1' }

  render() {
    const listingId = this.props.match.params.listingID
    const vars = { listingId }

    if (this.state.redirect) {
      return <Redirect to={this.state.redirect} push />
    }

    return (
      <>
        <DocumentTitle
          pageTitle={
            <fbt desc="listing.title">
              Listing <fbt:param name="id">{listingId}</fbt:param>
            </fbt>
          }
        />
        <Query query={query} variables={vars}>
          {({ networkStatus, error, data, refetch }) => {
            if (networkStatus <= 2) {
              return <LoadingSpinner />
            } else if (error) {
              return <QueryError error={error} query={query} vars={vars} />
            } else if (!data || !data.marketplace) {
              return <div>No marketplace contract?</div>
            }

            const listing = data.marketplace.listing
            if (!listing) {
              return (
                <div>
                  <fbt desc="listing.listing-not-found">Listing not found</fbt>
                </div>
              )
            } else if (!listing.valid) {
              return (
                <div>
                  <fbt desc="listing.listing-invalid">Listing invalid</fbt>
                </div>
              )
            }

            const from = get(data, 'web3.primaryAccount.id')

            const wrappedRefetch = async redirect => {
              await refetch()
              this.setState({ redirect })
            }

            return (
              <Switch>
                <Route
                  path="/listing/:listingID/onboard"
                  render={() => (
                    <Onboard listing={listing} quantity={this.state.quantity} />
                  )}
                />
                <Route
                  path="/listing/:listingID/edit"
                  render={() => (
                    <EditListing listing={listing} refetch={wrappedRefetch} />
                  )}
                />
                <Route
                  render={() => (
                    <ListingDetail
                      listing={listing}
                      refetch={wrappedRefetch}
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
      </>
    )
  }
}

export default Listing
