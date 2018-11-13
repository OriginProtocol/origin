import React, { Component } from 'react'
import { Query } from 'react-apollo'
import lGet from 'lodash/get'

import {
  Button,
  ButtonGroup,
  Spinner,
  Tabs,
  Tab,
  Tooltip
} from '@blueprintjs/core'

import BottomScrollListener from 'components/BottomScrollListener'
import { get, set } from 'utils/store'

import ListingsList from './_ListingsList'
import ListingsGallery from './_ListingsGallery'
import Events from './_Events'
import CreateListing from './mutations/CreateListing'

import query from './queries/_listings'

function nextPage(fetchMore, after) {
  fetchMore({
    variables: { first: 15, after },
    updateQuery: (prev, { fetchMoreResult }) => {
      if (!fetchMoreResult) return prev
      return {
        marketplace: {
          ...prev.marketplace,
          listings: {
            ...prev.marketplace.listings,
            pageInfo: fetchMoreResult.marketplace.listings.pageInfo,
            nodes: [
              ...prev.marketplace.listings.nodes,
              ...fetchMoreResult.marketplace.listings.nodes
            ]
          }
        }
      }
    }
  })
}

class Listings extends Component {
  state = { mode: get('listingsPage.mode', 'gallery') }
  render() {
    let selectedTabId = 'listings'
    if (this.props.location.pathname.match(/activity/)) {
      selectedTabId = 'activity'
    }

    return (
      <Query
        query={query}
        variables={{ first: 15 }}
        notifyOnNetworkStatusChange={true}
      >
        {({ error, data, fetchMore, networkStatus, refetch }) => {
          if (networkStatus === 1) {
            return (
              <div style={{ maxWidth: 300, marginTop: 100 }}>
                <Spinner />
              </div>
            )
          }

          if (!data || !data.marketplace) {
            return <p className="p-3">No marketplace contract?</p>
          }

          if (error) {
            console.log(error)
            return <p>Error :(</p>
          }

          const listings = lGet(data, 'marketplace.listings.nodes', [])
          const hasNextPage = lGet(
            data,
            'marketplace.listings.pageInfo.hasNextPage'
          )
          const after = lGet(data, 'marketplace.listings.pageInfo.endCursor')
          const totalListings = data.marketplace.listings.totalCount

          window.requestAnimationFrame(() => {
            if (
              document.body.clientHeight < window.innerHeight &&
              hasNextPage &&
              networkStatus === 7
            ) {
              nextPage(fetchMore, after)
            }
          })

          const noMore = selectedTabId !== 'listings' || !hasNextPage

          return (
            <BottomScrollListener
              offset={this.state.mode === 'list' ? 50 : 200}
              onBottom={() => {
                if (!noMore) {
                  nextPage(fetchMore, after)
                }
              }}
            >
              <div className="p-3">
                {this.renderBreadcrumbs({
                  refetch,
                  networkStatus,
                  totalListings,
                  selectedTabId
                })}

                {selectedTabId === 'activity' ? (
                  <Events />
                ) : this.state.mode === 'list' ? (
                  <ListingsList listings={listings} />
                ) : (
                  <ListingsGallery listings={listings} noMore={noMore} />
                )}

                {noMore || this.state.mode === 'gallery' ? null : (
                  <Button
                    text="Load more..."
                    loading={networkStatus === 3}
                    className="mt-3"
                    onClick={() => nextPage(fetchMore, after)}
                  />
                )}
                <CreateListing
                  isOpen={this.state.createListing}
                  onCompleted={() => {
                    this.setState({ createListing: false })
                  }}
                />
              </div>
            </BottomScrollListener>
          )
        }}
      </Query>
    )
  }

  renderBreadcrumbs({ refetch, networkStatus, totalListings, selectedTabId }) {
    return (
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Tabs
          selectedTabId={selectedTabId}
          renderActiveTabPanelOnly={true}
          onChange={(newTab, prevTab) => {
            if (prevTab === newTab) {
              return
            }
            if (newTab === 'listings') {
              this.props.history.push(`/marketplace/listings`)
            } else if (newTab === 'activity') {
              this.props.history.push(`/marketplace/activity`)
            }
          }}
        >
          <Tab id="listings" title={`Listings (${totalListings})`} />
          <Tab id="activity" title="Activity" />
        </Tabs>
        <div style={{ display: 'flex', marginLeft: 30 }}>
          <Button
            onClick={() => this.setState({ createListing: true })}
            intent="primary"
            text="Create Listing"
          />
          {selectedTabId !== 'listings' ? null : (
            <ButtonGroup className="ml-2">
              <Tooltip content="Gallery Mode">
                <Button
                  icon="media"
                  active={this.state.mode === 'gallery'}
                  onClick={() => {
                    set('listingsPage.mode', 'gallery')
                    this.setState({ mode: 'gallery' })
                  }}
                />
              </Tooltip>
              <Tooltip content="List Mode">
                <Button
                  icon="list"
                  active={this.state.mode === 'list'}
                  onClick={() => {
                    set('listingsPage.mode', 'list')
                    this.setState({ mode: 'list' })
                  }}
                />
              </Tooltip>
            </ButtonGroup>
          )}
          <Tooltip content="Refresh">
            <Button
              icon="refresh"
              loading={networkStatus === 4}
              className="ml-2"
              onClick={() => refetch()}
            />
          </Tooltip>
        </div>
      </div>
    )
  }
}

export default Listings
