import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import gql from 'graphql-tag'
import get from 'lodash/get'
import { Spinner, Tabs, Tab } from '@blueprintjs/core'
import { Query } from 'react-apollo'
import fragments from '../../fragments'

import Identity from 'components/Identity'

import Listings from './_ListingsList'

const UserQuery = gql`
  query User($id: ID!) {
    marketplace {
      user(id: $id) {
        id
        account {
          id
          identity {
            id
            profile {
              id
              firstName
              lastName
              description
              avatar
            }
          }
        }
        offers(first: 10) {
          totalCount
          nodes {
            id
            listingId
            offerId
            listing {
              id
              title
            }
          }
        }
        listings(first: 10) {
          totalCount
          nodes {
            ...basicListingFields
          }
        }
      }
    }
  }
  ${fragments.Listing.basic}
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
        >
          {({ data, error, networkStatus }) => {
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

            const listings = get(data, 'marketplace.user.listings', [])
            const offers = get(data, 'marketplace.user.offers', [])
            const profile = get(
              data,
              'marketplace.user.account.identity.profile'
            )

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
                    panel={
                      !profile ? (
                        'No profile set up'
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'end' }}>
                          {!profile.avatar ? null : (
                            <img src={profile.avatar} style={{ width: 100 }} />
                          )}
                          <div style={{ margin: '10px 0 0 15px' }}>
                            <div style={{ fontWeight: 'bold', marginBottom: 10 }}>{`${
                              profile.firstName
                            } ${profile.lastName} `}</div>
                            {!profile.description ? null : (
                              <div>{profile.description}</div>
                            )}
                          </div>
                        </div>
                      )
                    }
                  />
                  <Tab
                    id="listings"
                    title={`Listings (${listings.totalCount})`}
                    panel={
                      <>
                        <h5 className="bp3-heading mb-0 mt-2">Listings</h5>
                        <Listings listings={listings.nodes} />
                      </>
                    }
                  />
                  <Tab
                    id="offers"
                    title={`Offers (${offers.totalCount})`}
                    panel={
                      <>
                        <h5 className="bp3-heading mb-0 mt-3">Offers</h5>
                        <table className="bp3-html-table bp3-small bp3-html-table-bordered">
                          <thead>
                            <tr>
                              <th>Listing</th>
                              <th>Offer</th>
                              <th>Title</th>
                            </tr>
                          </thead>
                          <tbody>
                            {offers.nodes.map(offer => (
                              <tr key={`${offer.listing.id}-${offer.id}`}>
                                <td>{offer.listingId}</td>
                                <td>{offer.offerId}</td>
                                <td>{offer.listing.title}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </>
                    }
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
