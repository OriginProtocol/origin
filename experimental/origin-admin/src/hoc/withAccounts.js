import React from 'react'
import { Query } from 'react-apollo'
import gql from 'graphql-tag'

const AccountsQuery = gql`
  {
    web3 {
      accounts {
        id
        name
        role
        balance {
          eth
        }
      }
    }
  }
`

function withAccounts(WrappedComponent) {
  const WithAccounts = props => (
    <Query query={AccountsQuery}>
      {({ data }) => (
        <WrappedComponent
          {...props}
          accounts={
            data && data.web3 && data.web3.accounts ? data.web3.accounts : []
          }
        />
      )}
    </Query>
  )
  return WithAccounts
}

export default withAccounts
