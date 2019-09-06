import React from 'react'
import { Mutation } from 'react-apollo'
import gql from 'graphql-tag'

import fragments from 'queries/Fragments'
import query from 'queries/AllAccounts'

const SetActiveWalletMutation = gql`
  mutation SetActiveWallet($address: String!) {
    setActiveWallet(address: $address) {
      ...balanceFields
    }
  }
  ${fragments.Account.balance}
`

const SetWalletMutation = ({ children }) => (
  <Mutation
    mutation={SetActiveWalletMutation}
    update={(cache, result) => {
      const res = cache.readQuery({ query })
      cache.writeQuery({
        query,
        data: {
          web3: {
            ...res.web3,
            defaultAccount: result.data.setActiveWallet
          }
        }
      })
    }}
  >
    {mutation => children(mutation)}
  </Mutation>
)

export default SetWalletMutation
