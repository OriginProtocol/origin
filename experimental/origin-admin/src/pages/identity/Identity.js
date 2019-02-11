import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import gql from 'graphql-tag'
import get from 'lodash/get'
import { Query } from 'react-apollo'

import Identity from 'components/Identity'
import LoadingSpinner from 'components/LoadingSpinner'

import UserProfile from '../users/UserProfile'

const IdentityQuery = gql`
  query Identity($id: ID!) {
    identity(id: $id) {
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
`

class IdentityPage extends Component {
  state = {}
  render() {
    const identityId = this.props.match.params.identityId
    return (
      <div className="mt-3 ml-3">
        <Query
          query={IdentityQuery}
          variables={{ id: identityId }}
          notifyOnNetworkStatusChange={true}
        >
          {({ data, error, networkStatus }) => {
            if (networkStatus === 1) {
              return <LoadingSpinner />
            } else if (!data || !data.identity) {
              return <p className="p-3">No marketplace contract?</p>
            } else if (error) {
              return <p className="p-3">Error :(</p>
            }

            const profile = get(data, 'identity')

            return (
              <div>
                <ul className="bp3-breadcrumbs mb-2">
                  <li>
                    <Link className="bp3-breadcrumb" to="/identities">
                      Identities
                    </Link>
                  </li>
                  <li>
                    <Identity account={identityId} />
                  </li>
                </ul>
                <UserProfile profile={profile} />
              </div>
            )
          }}
        </Query>
      </div>
    )
  }
}

export default IdentityPage
