import gql from 'graphql-tag'

import mnemonicToAccounts, {
  mnemonicToMasterAccount
} from '../src/utils/mnemonicToAccount'
import demoListings from './_demoListings'
import get from 'lodash/get'
import sortBy from 'lodash/sortBy'

import {
  ImportWalletsMutation,
  ToggleMetaMaskMutation,
  EnableMessagingMutation
} from './mutations'

const query = gql`
  subscription onTransactionUpdated {
    transactionUpdated {
      id
      status
      mutation
      confirmations
    }
  }
`

const NodeAccountsQuery = gql`
  query NodeAccounts {
    web3 {
      nodeAccounts {
        id
        balance {
          eth
        }
      }
    }
  }
`

async function getNodeAccount(gqlClient) {
  const NodeAcctsData = await gqlClient.query({ query: NodeAccountsQuery })
  const UnsortedAccts = get(NodeAcctsData, 'data.web3.nodeAccounts')
  const NodeAccountObj = sortBy(UnsortedAccts, a => -Number(a.balance.eth))[0]
  return NodeAccountObj.id
}

export default async function populate(gqlClient, log, done) {
  async function mutate(mutation, from, variables = {}) {
    variables.from = from
    let result
    try {
      result = await gqlClient.mutate({ mutation, variables })
    } catch (e) {
      console.log(JSON.stringify(e, null, 4))
      throw e
    }
    const key = Object.keys(result.data)[0]
    const hash = result.data[key].id
    if (hash) {
      return await transactionConfirmed(hash, gqlClient)
    }
    return result.data[key]
  }

  const NodeAccount = await getNodeAccount(gqlClient)
  log(`Using NodeAccount ${NodeAccount}`)

  await mutate(ToggleMetaMaskMutation, null, { enabled: false })
  log(`Disabled MetaMask`)

  const accounts = mnemonicToAccounts()
  const res = await mutate(ImportWalletsMutation, null, { accounts })
  const [Admin, Seller, Buyer, Arbitrator, Affiliate] = res.map(r => r.id)
  log(`Imported wallets`)

  await mutate(EnableMessagingMutation)
  log(`Enabled messaging for account Admin ${Admin}`)

  await mutate(ToggleMetaMaskMutation, null, { enabled: true })
  log(`Enabled MetaMask`)

  if (done) {
    done()
  }
}
