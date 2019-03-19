import React from 'react'
import { Query } from 'react-apollo'
import gql from 'graphql-tag'
import get from 'lodash/get'

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
      metaMaskAccount {
        id
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
      {({ data }) => {
        const accounts = get(data, 'web3.accounts') || []
        const mmAccount = get(data, 'web3.metaMaskAccount')
        if (mmAccount && !accounts.find(a => a.id === mmAccount.id)) {
          accounts.push({ ...mmAccount, name: 'MetaMask', role: 'Wallet' })
        }
        return <WrappedComponent {...props} accounts={accounts} />
      }}
    </Query>
  )
  return WithAccounts
}

export default withAccounts
