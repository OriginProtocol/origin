import React, { Component } from 'react'
import { Query } from 'react-apollo'

import gql from 'graphql-tag'

const AccountsWithAllowance = gql`
  query AccountsWithAllowance($marketplace: String) {
    web3 {
      accounts {
        id
        role
        name
        ogn: token(symbol: "OGN") {
          id
          balance
          allowance(contract: $marketplace)
        }
      }
      useMetaMask
      metaMaskAccount {
        id
        role
        name
      }
    }
  }
`

const AllAccounts = gql`
  query AllAccounts {
    web3 {
      accounts {
        id
        role
        name
      }
      useMetaMask
      metaMaskAccount {
        id
        role
        name
      }
    }
  }
`

function withAccounts(WrappedComponent, marketplace) {
  return class WithAccounts extends Component {
    render() {
      let query = AllAccounts,
        variables
      if (marketplace) {
        query = AccountsWithAllowance
        variables = { marketplace }
      }

      return (
        <Query query={query} variables={variables} fetchPolicy="network-only">
          {({ loading, error, data }) => {
            if (loading || error) {
              return null
            }
            return <WrappedComponent {...this.props} {...data.web3} />
          }}
        </Query>
      )
    }
  }
}

export default withAccounts
