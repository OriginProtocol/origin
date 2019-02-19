import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import gql from 'graphql-tag'
import get from 'lodash/get'
import { Tabs, Tab } from '@blueprintjs/core'
import { Query } from 'react-apollo'

import Identity from 'components/Identity'
import LoadingSpinner from 'components/LoadingSpinner'

import UserListings from './UserListings'
import UserOffers from './UserOffers'
import UserProfile from './UserProfile'

const UserQuery = gql`
  query User($id: ID!) {
    marketplace {
      user(id: $id) {
        id
        account {
          id
          identity {
            id
            firstName
            lastName
            description
            avatar

            facebookVerified
            twitterVerified
            airbnbVerified
            phoneVerified
            emailVerified
          }
        }
        listings {
          totalCount
        }
        offers {
          totalCount
        }
      }
    }
  }
`

class User extends Component {
  state = {}
  render() {
    const userId = this.props.match.params.userId
    let selectedTabId = 'identity'
    if (this.props.location.pathname.match(/listings$/)) {
      selectedTabId = 'listings'
    } else if (this.props.location.pathname.match(/offers/)) {
      selectedTabId = 'offers'
    }
    return (
      <div className="mt-3 ml-3">
        <Query
          query={UserQuery}
          variables={{ id: userId }}
          notifyOnNetworkStatusChange={true}
          skip={!userId}
        >
          {({ data, error, networkStatus }) => {
            if (error) {
              return <p className="p-3">Error :(</p>
            } else if (networkStatus === 1) {
              return <LoadingSpinner />
            } else if (!data || !data.marketplace) {
              return <p className="p-3">No marketplace contract?</p>
            }

            const listings = get(data, 'marketplace.user.listings', [])
            const offers = get(data, 'marketplace.user.offers', [])
            const profile = get(data, 'marketplace.user.account.identity')

            return (
              <div>
                <ul className="bp3-breadcrumbs mb-2">
                  <li>
                    <Link className="bp3-breadcrumb" to="/users">
                      Users
                    </Link>
                  </li>
                  <li>
                    <Identity account={userId} />
                  </li>
                </ul>

                <Tabs
                  selectedTabId={selectedTabId}
                  renderActiveTabPanelOnly={true}
                  onChange={(newTab, prevTab) => {
                    if (prevTab === newTab) {
                      return
                    }
                    if (newTab === 'listings') {
                      this.props.history.push(`/users/${userId}/listings`)
                    } else if (newTab === 'offers') {
                      this.props.history.push(`/users/${userId}/offers`)
                    } else {
                      this.props.history.push(`/users/${userId}`)
                    }
                  }}
                >
                  <Tab
                    id="identity"
                    title={`Identity`}
                    panel={<UserProfile profile={profile} />}
                  />
                  <Tab
                    id="listings"
                    title={`Listings (${listings.totalCount})`}
                    panel={<UserListings userId={userId} />}
                  />
                  <Tab
                    id="offers"
                    title={`Offers (${offers.totalCount})`}
                    panel={<UserOffers userId={userId} />}
                  />
                </Tabs>
              </div>
            )
          }}
        </Query>
      </div>
    )
  }
}

export default User
