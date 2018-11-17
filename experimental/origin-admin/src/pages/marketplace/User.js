import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import gql from 'graphql-tag'
import get from 'lodash/get'
import { Spinner } from '@blueprintjs/core'
import { Query } from 'react-apollo'
import fragments from '../../fragments'

import Identity from 'components/Identity'

import Listings from './_ListingsList'

const UserQuery = gql`
  query User($id: ID!) {
    marketplace {
      user(id: $id) {
        id
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

            const offers = get(data, 'marketplace.user.offers.nodes', [])
            const listings = get(data, 'marketplace.user.listings.nodes', [])

            return (
              <div>
                <ul className="bp3-breadcrumbs">
                  <li>
                    <Link className="bp3-breadcrumb" to="/users">
                      Users
                    </Link>
                  </li>
                  <li>
                    <Identity account={userId} />
                  </li>
                </ul>
                {!listings.length ? null : (
                  <>
                    <h5 className="bp3-heading mb-0 mt-2">Listings</h5>
                    <Listings listings={listings} />
                  </>
                )}
                {!offers.length ? null : (
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
                        {offers.map(offer => (
                          <tr key={`${offer.listing.id}-${offer.id}`}>
                            <td>{offer.listingId}</td>
                            <td>{offer.offerId}</td>
                            <td>{offer.listing.title}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </>
                )}
                {/*<div className="p-3">
                  <pre>{JSON.stringify(data, null, 4)}</pre>
                </div>*/}
              </div>
            )
          }}
        </Query>
      </div>
    )
  }
}

export default User
