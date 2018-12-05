import React, { Component } from 'react'
import { Query } from 'react-apollo'
import gql from 'graphql-tag'

import ListingPreview from './_ListingPreview'
import Stage from './_Stage'
import HelpMessaging from './_HelpMessaging'

const query = gql`
  query WalletStatus {
    web3 {
      metaMaskAccount {
        id
      }
    }
    messaging(id: "defaultAccount") {
      enabled
    }
  }
`

class OnboardMessaging extends Component {
  state = {}
  render() {
    const { listing } = this.props
    return (
      <Query query={query} notifyOnNetworkStatusChange={true}>
        {({ error, data, networkStatus }) => {
          if (networkStatus === 1) {
            return <div>Loading...</div>
          } else if (error) {
            return <p className="p-3">Error :(</p>
          } else if (!data || !data.web3) {
            return <p className="p-3">No Web3</p>
          }

          return (
            <>
              <div className="step">Step 2</div>
              <h3>Enable Messaging</h3>
              <div className="row">
                <div className="col-md-8">
                  <Stage stage={2} />
                  <pre>{JSON.stringify(data, null, 4)}</pre>
                </div>
                <div className="col-md-4">
                  <ListingPreview listing={listing} />
                  <HelpMessaging />
                </div>
              </div>
            </>
          )
        }}
      </Query>
    )
  }
}

export default OnboardMessaging

require('react-styl')(`
  .metamask-install
    border: 1px solid var(--light)
    border-radius: 5px
    padding: 2rem
    display: flex
    flex-direction: column
    align-items: center
`)
