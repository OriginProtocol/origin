import React, { Component } from 'react'
import { Query } from 'react-apollo'
import { Link } from 'react-router-dom'
import get from 'lodash/get'

import {
  Button,
  ButtonGroup,
  NonIdealState,
  AnchorButton,
  Tooltip,
  Tag,
  Tabs,
  Tab
} from '@blueprintjs/core'

import currency from 'utils/currency'
import withAccounts from 'hoc/withAccounts'
import {
  MakeOffer,
  WithdrawListing,
  AddData,
  CreateListing
} from '../marketplace/mutations'
import Offers from '../marketplace/_Offers'
import EventsTable from '../marketplace/_EventsTable'
import Identity from 'components/Identity'
import Price from 'components/Price2'
import Gallery from 'components/Gallery'
import LoadingSpinner from 'components/LoadingSpinner'
import QueryError from 'components/QueryError'

import query from 'queries/Listing'

class Listing extends Component {
  state = {}
  render() {
    const listingId = this.props.match.params.listingID

    return (
      <div className="p-3">
        {this.renderBreadcrumbs()}
        <Query query={query} variables={{ listingId }}>
          {({ networkStatus, error, data }) => {
            if (networkStatus === 1) {
              return <LoadingSpinner />
            } else if (error) {
              return <QueryError error={error} query={query} />
            } else if (!data || !data.marketplace) {
              return 'No marketplace contract?'
            }

            const listing = data.marketplace.listing

            if (!listing) {
              return (
                <div style={{ maxWidth: 500, marginTop: 50 }}>
                  <NonIdealState
                    icon="help"
                    title="Listing not found"
                    action={
                      <AnchorButton href="#/marketplace" icon="arrow-left">
                        Back to Listings
                      </AnchorButton>
                    }
                  />
                </div>
              )
            }

            let selectedTabId = 'offers'
            if (this.props.location.pathname.match(/events$/)) {
              selectedTabId = 'events'
            }

            const media = get(data, 'marketplace.listing.media') || []

            return (
              <>
                <div style={{ display: 'flex' }}>
                  {!media.length && !listing.description ? null : (
                    <div style={{ maxWidth: 300, margin: '20px 20px 0 0' }}>
                      {!media.length ? null : <Gallery pics={media} />}
                      <div className="mt-2" style={{ whiteSpace: 'pre-wrap' }}>
                        {listing.description}
                      </div>
                    </div>
                  )}
                  <div>
                    <h3 className="bp3-heading mt-3">{listing.title}</h3>{' '}
                    {this.renderDetail(listing)}
                    <Tabs
                      selectedTabId={selectedTabId}
                      onChange={(newTab, prevTab) => {
                        if (prevTab === newTab) {
                          return
                        }
                        if (newTab === 'offers') {
                          this.props.history.push(
                            `/marketplace/listings/${listingId}`
                          )
                        } else if (newTab === 'events') {
                          this.props.history.push(
                            `/marketplace/listings/${listingId}/events`
                          )
                        }
                      }}
                    >
                      <Tab
                        id="offers"
                        title="Offers"
                        panel={
                          <>
                            <Offers
                              listing={listing}
                              listingId={listingId}
                              offers={listing.allOffers}
                            />

                            <Button
                              intent="primary"
                              onClick={() => this.setState({ makeOffer: true })}
                            >
                              {`Make Offer for `}
                              <Price price={listing.price} />
                            </Button>
                          </>
                        }
                      />
                      <Tab
                        id="events"
                        title="Events"
                        panel={<EventsTable events={listing.events} />}
                      />
                    </Tabs>
                  </div>
                </div>

                <MakeOffer
                  {...this.state}
                  isOpen={this.state.makeOffer}
                  listing={listing}
                  onCompleted={() => this.setState({ makeOffer: false })}
                />
                <CreateListing
                  isOpen={this.state.updateListing}
                  listing={listing}
                  onCompleted={() => this.setState({ updateListing: false })}
                />
                <WithdrawListing
                  isOpen={this.state.withdrawListing}
                  listing={listing}
                  onCompleted={() => this.setState({ withdrawListing: false })}
                />
                <AddData
                  isOpen={this.state.addData}
                  listing={listing}
                  onCompleted={() => this.setState({ addData: false })}
                />
              </>
            )
          }}
        </Query>
      </div>
    )
  }

  renderDetail(listing) {
    const accounts = this.props.accounts
    const sellerPresent = accounts.find(
      a => listing.seller && a.id === listing.seller.id
    )
    const units = listing.unitsTotal <= 1 ? '' : `${listing.unitsTotal} items `
    const available = ` (${listing.unitsAvailable} available) `
    return (
      <div style={{ marginBottom: 10 }}>
        {`${units}${available}${listing.categoryStr} by `}
        <Identity account={listing.seller} />
        <span style={{ marginRight: 10 }}>
          {` for `}
          <Price price={listing.price} />
          {`. Deposit managed by `}
          <Identity account={listing.arbitrator} />
        </span>
        {this.renderActions(sellerPresent, listing)}
        {listing.status === 'withdrawn' ? (
          <Tag style={{ marginLeft: 15 }}>Withdrawn</Tag>
        ) : (
          <Tag style={{ marginLeft: 15 }} intent="success">
            Active
          </Tag>
        )}
        <br />
        <span style={{ marginRight: 10 }}>
          Commission:{' '}
          {currency({ amount: listing.depositAvailable, currency: 'OGN' })}/
          {currency({ amount: listing.commission, currency: 'OGN' })}
        </span>
        <span>
          Per-unit commission:{' '}
          {currency({ amount: listing.commissionPerUnit, currency: 'OGN' })}
        </span>
      </div>
    )
  }

  renderActions(sellerPresent = false, listing) {
    return (
      <>
        {listing.status === 'withdrawn' ? null : (
          <>
            <Tooltip content="Update">
              <AnchorButton
                disabled={!sellerPresent}
                small={true}
                icon="edit"
                onClick={() => this.setState({ updateListing: true })}
              />
            </Tooltip>
            <Tooltip content="Delete">
              <AnchorButton
                intent="danger"
                icon="trash"
                small={true}
                disabled={!sellerPresent}
                style={{ marginLeft: 5 }}
                onClick={() => this.setState({ withdrawListing: true })}
              />
            </Tooltip>
          </>
        )}
        <Tooltip content="Add Data">
          <AnchorButton
            icon="comment"
            small={true}
            style={{ marginLeft: 5 }}
            onClick={() => this.setState({ addData: true })}
          />
        </Tooltip>
      </>
    )
  }

  renderBreadcrumbs() {
    const { match, history } = this.props
    const [netId, contractId, id] = match.params.listingID.split('-')
    const url = `/marketplace/listings/${netId}-${contractId}-`
    const listingId = Number(id)

    return (
      <ul className="bp3-breadcrumbs">
        <li>
          <Link className="bp3-breadcrumb" to="/marketplace">
            Listings
          </Link>
        </li>
        <li>
          <span className="bp3-breadcrumb bp3-breadcrumb-current">
            {`Listing #${listingId}`}
          </span>
          <ButtonGroup>
            <Button
              icon="arrow-left"
              style={{ marginLeft: 10 }}
              disabled={listingId === 0}
              onClick={() => history.push(`${url}${listingId - 1}`)}
            />
            <Button
              icon="arrow-right"
              onClick={() => history.push(`${url}${listingId + 1}`)}
            />
          </ButtonGroup>
        </li>
      </ul>
    )
  }
}

export default withAccounts(Listing, 'marketplace')
