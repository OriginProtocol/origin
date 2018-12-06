import React, { Component } from 'react'
import { Query } from 'react-apollo'
import gql from 'graphql-tag'

// import Link from 'components/Link'

import ListingPreview from './_ListingPreview'
import Stage from './_Stage'
import HelpProfile from './_HelpProfile'

const query = gql`
  query WalletStatus {
    web3 {
      metaMaskAccount {
        id
      }
    }
  }
`

class OnboardAttestations extends Component {
  state = {}
  render() {
    const { listing } = this.props
    return (
      <>
        <div className="step">Step 5</div>
        <h3>Strengthen your profile with attestations</h3>
        <div className="row">
          <div className="col-md-8">
            <Stage stage={5} />
            <Query query={query} notifyOnNetworkStatusChange={true}>
              {({ error, data, networkStatus }) => {
                if (networkStatus === 1) {
                  return <div>Loading...</div>
                } else if (error) {
                  return <p className="p-3">Error :(</p>
                } else if (!data || !data.web3) {
                  return <p className="p-3">No Web3</p>
                }

                // const nextLink = `/listings/${listing.id}/onboard/attestations`

                return (
                  <div className="onboard-box">
                    Attestations
                  </div>
                )
              }}
            </Query>
          </div>
          <div className="col-md-4">
            <ListingPreview listing={listing} />
            <HelpProfile />
          </div>
        </div>
      </>
    )
  }
}

export default OnboardAttestations

require('react-styl')(`
`)
