import React, { Component } from 'react'
import { Query } from 'react-apollo'
import pick from 'lodash/pick'

import {
  Button,
  ButtonGroup,
  Tooltip,
  Switch,
  InputGroup,
  ControlGroup
} from '@blueprintjs/core'

import BottomScrollListener from 'components/BottomScrollListener'
import LoadingSpinner from 'components/LoadingSpinner'
import QueryError from 'components/QueryError'
import { getDiscovery } from 'utils/config'
import store from 'utils/store'
import nextPageFactory from 'utils/nextPageFactory'

import ListingsList from './_ListingsList'
import ListingsGallery from './_ListingsGallery'
import CreateListing from '../marketplace/mutations/CreateListing'

import query from 'queries/AllListings'

const memStore = store('memory')
const localStore = store('localStorage')
const nextPage = nextPageFactory('marketplace.listings')

class Listings extends Component {
  state = {
    first: 15,
    mode: localStore.get('listingsPage.mode', 'gallery'),
    searchInput: memStore.get('listingsPage.search', ''),
    search: memStore.get('listingsPage.search'),
    hidden: false
  }

  render() {
    const vars = pick(this.state, 'first', 'sort', 'hidden', 'search')

    return (
      <Query query={query} variables={vars} notifyOnNetworkStatusChange={true}>
        {({ error, data, fetchMore, networkStatus, refetch }) => {
          if (networkStatus === 1) {
            return <LoadingSpinner />
          } else if (error) {
            return <QueryError error={error} query={query} />
          } else if (!data || !data.marketplace) {
            return <p className="p-3">No marketplace contract?</p>
          }

          const { nodes, pageInfo, totalCount } = data.marketplace.listings
          const { hasNextPage, endCursor: after } = pageInfo

          return (
            <BottomScrollListener
              offset={this.state.mode === 'list' ? 50 : 200}
              ready={networkStatus === 7}
              hasMore={hasNextPage}
              onBottom={() => nextPage(fetchMore, { ...vars, after })}
            >
              <div className="p-3">
                {this.renderHeader({ refetch, networkStatus, totalCount })}

                {this.state.mode === 'list' ? (
                  <ListingsList listings={nodes} />
                ) : (
                  <ListingsGallery listings={nodes} hasNextPage={hasNextPage} />
                )}

                {!hasNextPage || this.state.mode === 'gallery' ? null : (
                  <Button
                    text="Load more..."
                    loading={networkStatus === 3}
                    className="mt-3"
                    onClick={() => nextPage(fetchMore, { ...vars, after })}
                  />
                )}
                <CreateListing
                  isOpen={this.state.createListing}
                  onCompleted={() => this.setState({ createListing: false })}
                />
              </div>
            </BottomScrollListener>
          )
        }}
      </Query>
    )
  }

  doSearch(search) {
    this.setState({ activeSearch: search, search })
    memStore.set('listingsPage.search', search)
  }

  renderHeader({ refetch, networkStatus, totalCount }) {
    const discovery = getDiscovery()

    return (
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <h5 className="bp3-heading mb-0 mr-3">{`${totalCount} Listings`}</h5>
          {!discovery ? null : (
            <ControlGroup className="mr-2">
              <InputGroup
                placeholder="Search..."
                value={this.state.searchInput}
                onChange={e => this.setState({ searchInput: e.target.value })}
                onKeyUp={e => {
                  if (e.keyCode === 13) this.doSearch(this.state.searchInput)
                }}
                rightElement={
                  this.state.searchInput ? (
                    <Button
                      minimal={true}
                      icon="cross"
                      onClick={() => this.doSearch('')}
                    />
                  ) : null
                }
              />
              <Button
                icon="search"
                loading={networkStatus === 2}
                onClick={() => this.doSearch(this.state.searchInput)}
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
                  localStore.set('listingsPage.mode', 'gallery')
                  this.setState({ mode: 'gallery' })
                }}
              />
            </Tooltip>
            <Tooltip content="List Mode">
              <Button
                icon="list"
                active={this.state.mode === 'list'}
                onClick={() => {
                  localStore.set('listingsPage.mode', 'list')
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
