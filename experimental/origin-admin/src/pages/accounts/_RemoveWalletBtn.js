import React from 'react'
import { Mutation } from 'react-apollo'
import gql from 'graphql-tag'
import { Button, Tooltip } from '@blueprintjs/core'

import query from 'queries/AllAccounts'

const RemoveWallet = gql`
  mutation RemoveWallet($address: String!) {
    removeWallet(address: $address)
  }
`

const RemoveWalletBtn = ({ address }) => (
  <Mutation
    mutation={RemoveWallet}
    update={cache => {
      const res = cache.readQuery({ query })
      cache.writeQuery({
        query,
        data: {
          web3: {
            ...res.web3,
            accounts: res.web3.accounts.filter(a => a.id !== address)
          }
        }
      })
    }}
  >
    {removeWallet => (
      <Tooltip content="Remove">
        <Button
          icon="trash"
          style={{ marginLeft: '0.25rem' }}
          onClick={() => removeWallet({ variables: { address } })}
        />
      </Tooltip>
    )}
  </Mutation>
)

export default RemoveWalletBtn
