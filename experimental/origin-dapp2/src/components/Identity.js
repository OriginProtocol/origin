import React, { Component } from 'react'
import { Query } from 'react-apollo'

import gql from 'graphql-tag'

const IdentityQuery = gql`
  query IdentityQuery($account: String!) {
    web3 {
      account(id: $account) {
        id
        identity {
          id
          profile {
            id
            fullName
          }
        }
      }
    }
  }
`

class Identity extends Component {
  render() {
    let { account } = this.props
    if (typeof account === 'object') {
      account = account.id
    }
    if (!account) return null
    return (
      <Query query={IdentityQuery} variables={{ account }}>
        {({ loading, error, data }) => {
          if (loading || error) return account.substr(0, 6)
          try {
            const { fullName } = data.web3.account.identity
            if (!fullName) {
              return <span>{account.substr(0, 6)}</span>
            }
            return <span>{`${fullName}`}</span>
          } catch (e) {
            return account.substr(0, 6)
          }
        }}
      </Query>
    )
  }
}

export default Identity
