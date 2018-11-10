import React, { Component } from 'react'
import { Query } from 'react-apollo'
import { Link } from 'react-router-dom'

import {
  Button,
  ButtonGroup,
  NonIdealState,
  AnchorButton,
  Tooltip,
  Tag,
  Tabs,
  Tab,
  Spinner
} from '@blueprintjs/core'

import currency from 'utils/currency'
import withAccounts from 'hoc/withAccounts'
import { MakeOffer, WithdrawListing, AddData, UpdateListing } from './mutations'
import Offers from './_Offers'
import EventsTable from './_EventsTable'
import Identity from 'components/Identity'
import Price from 'components/Price'
import Gallery from 'components/Gallery'

import query from './queries/_offers'

class Listing extends Component {
  state = {}
  render() {
    const listingId = this.props.match.params.listingID

    return (
      <div className="p-3">
        {this.renderBreadcrumbs()}
        <Query query={query} variables={{ listingId }}>
          {({ loading, error, data }) => {
            if (loading)
              return (
                <div style={{ maxWidth: 300, marginTop: 100 }}>
                  <Spinner />
                </div>
              )

            if (error) {
              console.log(error)
              console.log(query.loc.source.body)
              return <p className="mt-3">Error :(</p>
            }
            if (!data.marketplace) {
              return null
            }

            const listing = data.marketplace.getListing
            const listingData = listing

            if (!listing || !listingData) {
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

            const media = (data.marketplace.getListing || {}).media || []

            return (
              <>
                <div style={{ display: 'flex' }}>
                  {!media.length && !listingData.description ? null : (
                    <div style={{ maxWidth: 300, margin: '20px 20px 0 0' }}>
                      {!media.length ? null : <Gallery pics={media} />}
                      <div className="mt-2">{listingData.description}</div>
                    </div>
                  )}
                  <div>
                    <h3 className="bp3-heading mt-3">{listingData.title}</h3>{' '}
                    {this.renderDetail({ listingData, listing })}
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
                              offers={listing.offers}
                            />

                            <Button
                              intent="primary"
                              onClick={() => this.setState({ makeOffer: true })}
                            >
                              {`Make Offer for `}
                              <Price
                                amount={
                                  listingData.price
                                    ? listingData.price.amount
                                    : 0
                                }
                              />
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
                  listing={listing}
                  isOpen={this.state.makeOffer}
                  onCompleted={() => {
                    this.setState({ makeOffer: false })
                  }}
                />
                <UpdateListing
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

  renderDetail({ listingData, listing }) {
    const accounts = this.props.accounts
    const sellerPresent = accounts.find(
      a => listing.seller && a.id === listing.seller.id
    )
    const units = listing.unitsTotal <= 1 ? '' : `${listing.unitsTotal} items `
    return (
      <div style={{ marginBottom: 10 }}>
        {`${units}${listingData.categoryStr} by `}
        <Identity account={listing.seller} />
        <span style={{ marginRight: 10 }}>
          {` for `}
          <Price
            amount={listingData.price ? listingData.price.amount : 0}
            showEth={true}
          />
          {`. Deposit managed by `}
          <Identity account={listing.arbitrator} />
          <span style={{ marginLeft: 10 }}>
            {currency({ amount: listing.deposit, currency: 'OGN' })}
          </span>
        </span>
        {this.renderActions(sellerPresent, listing)}
        {listing.status === 'active' ? (
          <Tag style={{ marginLeft: 15 }} intent="success">
            Active
          </Tag>
        ) : (
          <Tag style={{ marginLeft: 15 }}>Withdrawn</Tag>
        )}
      </div>
    )
  }

  renderActions(sellerPresent = false, listing) {
    return (
      <>
        {listing.status !== 'active' ? null : (
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
    const listingId = Number(this.props.match.params.listingID)
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
              disabled={listingId === 1}
              onClick={() => {
                this.props.history.push(
                  `/marketplace/listings/${Number(listingId - 1)}`
                )
              }}
            />
            <Button
              icon="arrow-right"
              onClick={() => {
                this.props.history.push(
                  `/marketplace/listings/${Number(listingId + 1)}`
                )
              }}
            />
          </ButtonGroup>
        </li>
      </ul>
    )
  }
}

export default withAccounts(Listing, 'marketplace')
