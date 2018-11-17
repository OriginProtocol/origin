import React, { Component } from 'react'
import { Query } from 'react-apollo'
import lGet from 'lodash/get'
import { getDiscovery } from '../../utils/config'

import {
  Button,
  ButtonGroup,
  Spinner,
  Tooltip,
  Switch,
  InputGroup,
  ControlGroup
} from '@blueprintjs/core'

import BottomScrollListener from 'components/BottomScrollListener'
import { get, set } from 'utils/store'

import ListingsList from './_ListingsList'
import ListingsGallery from './_ListingsGallery'
import CreateListing from './mutations/CreateListing'

import query from './queries/_listings'

function nextPage(fetchMore, vars) {
  fetchMore({
    variables: { ...vars },
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
  state = {
    mode: get('listingsPage.mode', 'gallery'),
    hidden: false,
    search: '',
    activeSearch: ''
  }

  render() {
    const vars = {
      first: 15,
      sort: this.state.sort,
      hidden: this.state.hidden,
      search: this.state.activeSearch
    }

    return (
      <Query query={query} variables={vars} notifyOnNetworkStatusChange={true}>
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
              nextPage(fetchMore, { ...vars, after })
            }
          })

          const noMore = !hasNextPage

          return (
            <BottomScrollListener
              offset={this.state.mode === 'list' ? 50 : 200}
              onBottom={() => {
                if (!noMore) {
                  nextPage(fetchMore, { ...vars, after })
                }
              }}
            >
              <div className="p-3">
                {this.renderBreadcrumbs({
                  refetch,
                  networkStatus,
                  totalListings
                })}

                {this.state.mode === 'list' ? (
                  <ListingsList listings={listings} />
                ) : (
                  <ListingsGallery listings={listings} noMore={noMore} />
                )}

                {noMore || this.state.mode === 'gallery' ? null : (
                  <Button
                    text="Load more..."
                    loading={networkStatus === 3}
                    className="mt-3"
                    onClick={() => nextPage(fetchMore, { ...vars, after })}
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

  renderBreadcrumbs({ refetch, networkStatus, totalListings }) {
    const discovery = getDiscovery()

    return (
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <h5 className="bp3-heading mb-0 mr-3">{`${totalListings} Listings`}</h5>
          {!discovery ? null : (
            <ControlGroup className="mr-2">
              <InputGroup
                placeholder="Search..."
                value={this.state.search}
                onChange={e => this.setState({ search: e.target.value })}
                onKeyUp={e => {
                  if (e.keyCode === 13) {
                    this.setState({ activeSearch: this.state.search })
                  }
                }}
                rightElement={
                  this.state.search ? (
                    <Button
                      minimal={true}
                      icon="cross"
                      onClick={() =>
                        this.setState({ activeSearch: '', search: '' })
                      }
                    />
                  ) : null
                }
              />
              <Button
                icon="search"
                onClick={() =>
                  this.setState({ activeSearch: this.state.search })
                }
              />
            </ControlGroup>
          )}
          <Button
            onClick={() => this.setState({ createListing: true })}
            intent="primary"
            text="Create Listing"
          />
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
          <Tooltip content="Refresh">
            <Button
              icon="refresh"
              loading={networkStatus === 4}
              className="ml-2"
              onClick={() => refetch()}
            />
          </Tooltip>
          {!discovery ? null : (
            <>
              <Switch
                checked={this.state.hidden ? true : false}
                onChange={e =>
                  this.setState({ hidden: e.target.checked ? true : false })
                }
                inline={true}
                className="ml-3 mb-0"
                label="Hide Hidden"
              />
              <Switch
                inline={true}
                className="mb-0"
                label="Sort Featured"
                checked={this.state.sort === 'featured' ? true : false}
                onChange={e =>
                  this.setState({ sort: e.target.checked ? 'featured' : '' })
                }
              />
            </>
          )}
        </div>
      </div>
    )
  }
}

export default Listings
