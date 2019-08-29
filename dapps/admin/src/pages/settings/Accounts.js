import React from 'react'
import { Mutation } from 'react-apollo'
import { useQuery } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import populate from '@origin/graphql/fixtures/populate'

import { Button } from '@blueprintjs/core'

import LoadingSpinner from 'components/LoadingSpinner'

import NodeAccounts from './_NodeAccounts'
import CreateWallet from './mutations/CreateWallet'
import query from 'queries/AllAccounts'

import Contracts from '../contracts/Contracts'
import AccountBalances from './AccountBalances'

const SetNetworkMutation = gql`
  mutation SetNetwork($network: String) {
    setNetwork(network: $network)
  }
`

const Accounts = () => {
  const { networkStatus, error, data, refetch, client } = useQuery(query, {
    notifyOnNetworkStatusChange: true
  })
  if (networkStatus === 1) {
    return <LoadingSpinner />
  }
  if (error) {
    console.log(error)
    return <p className="mt-3">Error :(</p>
  }
  if (!data || !data.web3) {
    return null
  }

  const maxNodeAccount = [...data.web3.nodeAccounts].sort((a, b) => {
    if (Number(a.balance.eth) > Number(b.balance.eth)) return -1
    if (Number(a.balance.eth) < Number(b.balance.eth)) return 1
    return 0
  })[0]

  return (
    <div className="p-3">
      <CreateWallet />
      <AccountBalances
        maxNodeAccount={maxNodeAccount ? maxNodeAccount.id : null}
      />
      <NodeAccounts data={data.web3.nodeAccounts} />
      <Mutation mutation={SetNetworkMutation}>
        {(setNetwork, { client }) => (
          <Button
            style={{ marginTop: '1rem' }}
            intent="danger"
            onClick={async () => {
              localStorage.clear()
              web3.eth.accounts.wallet.clear()
              setNetwork({ variables: { network: 'localhost' } })
              await client.reFetchObservableQueries()
            }}
            text="Reset"
          />
        )}
      </Mutation>
      <Button
        style={{ marginTop: '1rem', marginLeft: '0.5rem' }}
        intent="success"
        onClick={() => populate(client, console.log)}
        text="Populate"
      />
      <Button
        style={{ marginTop: '1rem', marginLeft: '0.5rem' }}
        icon="refresh"
        onClick={() => refetch()}
      />
      <hr style={{ marginTop: '1.5rem', marginBottom: '1rem' }} />
      <Contracts />
    </div>
  )
}

export default Accounts
