import React, { Component } from 'react'
import { Query } from 'react-apollo'

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

let lastFetched = 0
function nextPage(fetchMore, numListings) {
  if (numListings === lastFetched) return
  lastFetched = numListings

  fetchMore({
    variables: {
      offset: numListings,
      limit: 10
    },
    updateQuery: (prev, { fetchMoreResult }) => {
      if (!fetchMoreResult) return prev
      return {
        marketplace: {
          ...prev.marketplace,
          allListings: [
            ...prev.marketplace.allListings,
            ...fetchMoreResult.marketplace.allListings
          ]
        }
      }
    }
  })
}

// let nextFrame,
//   firstFrame = true
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
        variables={{ offset: 0, limit: 15 }}
        notifyOnNetworkStatusChange={true}
      >
        {({ error, data, fetchMore, networkStatus, refetch }) => {
          if (networkStatus === 1)
            return (
              <div style={{ maxWidth: 300, marginTop: 100 }}>
                <Spinner />
              </div>
            )
          if (!data || !data.marketplace)
            return <p className="p-3">No marketplace contract?</p>
          if (error) {
            console.log(error)
            return <p>Error :(</p>
          }

          const numListings = data.marketplace.allListings.length
          const totalListings = data.marketplace.totalListings

          window.requestAnimationFrame(() => {
            if (
              document.body.clientHeight < window.innerHeight &&
              numListings < totalListings &&
              networkStatus === 7
            ) {
              nextPage(fetchMore, numListings)
            }
          })

          const noMore =
            selectedTabId !== 'listings' ||
            Number(data.marketplace.totalListings) <= numListings

          return (
            <BottomScrollListener
              offset={this.state.mode === 'list' ? 50 : 200}
              onBottom={() => {
                nextPage(fetchMore, numListings)
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
                  <ListingsList data={data} />
                ) : (
                  <ListingsGallery data={data} noMore={noMore} />
                )}

                {noMore || this.state.mode === 'gallery' ? null : (
                  <Button
                    text="Load more..."
                    loading={networkStatus === 3}
                    className="mt-3"
                    onClick={() => nextPage(fetchMore, numListings)}
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
