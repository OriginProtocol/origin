import gql from 'graphql-tag'

import mnemonicToAccounts from '../src/utils/mnemonicToAccount'
import demoListings from './_demoListings'
import get from 'lodash/get'
import sortBy from 'lodash/sortBy'

import {
  ImportWalletsMutation,
  DeployTokenMutation,
  SendFromNodeMutation,
  TransferTokenMutation,
  DeployMarketplaceMutation,
  UpdateTokenAllowanceMutation,
  AddAffiliateMutation,
  DeployIdentityEventsContractMutation,
  DeployIdentityMutation,
  CreateListingMutation,
  CreateWalletMutation,
  UniswapDeployFactory,
  UniswapDeployExchangeTemplate,
  UniswapInitFactory,
  UniswapCreateExchange,
  UniswapAddLiquidity,
  ToggleMetaMaskMutation
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

const TransactionReceipt = gql`
  query TransactionReceipt($id: ID!) {
    web3 {
      transactionReceipt(id: $id) {
        id
        blockNumber
        contractAddress
        events {
          id
          event
          returnValuesArr {
            field
            value
          }
          raw {
            topics
          }
        }
      }
    }
  }
`

function transactionConfirmed(hash, gqlClient) {
  return new Promise(resolve => {
    const sub = gqlClient.subscribe({ query }).subscribe({
      next: async result => {
        const t = result.data.transactionUpdated
        if (t.id === hash && t.status === 'receipt') {
          sub.unsubscribe()
          const result = await gqlClient.query({
            query: TransactionReceipt,
            variables: { id: hash }
          })
          resolve(get(result, 'data.web3.transactionReceipt'))
        }
      }
    })
  })
}

export async function createUser(gqlClient, NodeAccount) {
  await gqlClient.mutate({
    mutation: ToggleMetaMaskMutation,
    variables: { enabled: false }
  })
  const result = await gqlClient.mutate({
    mutation: CreateWalletMutation,
    variables: { name: 'Seller', role: 'Seller' }
  })
  const user = result.data.createWallet.id
  await gqlClient.mutate({
    mutation: SendFromNodeMutation,
    variables: { from: NodeAccount, to: user, value: '0.5' }
  })
  return user
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
      const transaction = await transactionConfirmed(hash, gqlClient)
      return transaction.contractAddress || transaction
    }
    return result.data[key]
  }

  const NodeAcctsData = await gqlClient.query({ query: NodeAccountsQuery })
  const UnsortedAccts = get(NodeAcctsData, 'data.web3.nodeAccounts')
  const NodeAccountObj = sortBy(UnsortedAccts, a => -Number(a.balance.eth))[0]
  const NodeAccount = NodeAccountObj.id
  log(`Using NodeAccount ${NodeAccount}`)

  await mutate(ToggleMetaMaskMutation, null, { enabled: false })
  log(`Disabled MetaMask`)

  const accounts = mnemonicToAccounts()
  const res = await mutate(ImportWalletsMutation, null, { accounts })
  const [Admin, Seller, Buyer, Arbitrator, Affiliate] = res.map(r => r.id)

  await mutate(SendFromNodeMutation, NodeAccount, { to: Admin, value: '0.5' })
  log('Sent eth to Admin')

  const OGN = await mutate(DeployTokenMutation, Admin, {
    type: 'OriginToken',
    name: 'Origin Token',
    symbol: 'OGN',
    decimals: '18',
    supply: '1000000000'
  })
  log(`Deployed Origin token to ${OGN}`)

  const DAI = await mutate(DeployTokenMutation, Admin, {
    type: 'Standard',
    name: 'Dai Stablecoin',
    symbol: 'DAI',
    decimals: '18',
    supply: '1000000000'
  })
  log(`Deployed DAI stablecoin to ${DAI}`)

  const Marketplace = await mutate(DeployMarketplaceMutation, Admin, {
    token: OGN,
    version: '001',
    autoWhitelist: true
  })
  log(`Deployed marketplace to ${Marketplace}`)

  await mutate(SendFromNodeMutation, NodeAccount, { to: Seller, value: '0.5' })
  log('Sent eth to seller')

  await mutate(TransferTokenMutation, Admin, {
    to: Seller,
    token: OGN,
    value: '500'
  })
  log('Sent ogn to seller')

  await mutate(UpdateTokenAllowanceMutation, Seller, {
    token: OGN,
    to: Marketplace,
    value: '500'
  })
  log('Set seller token allowance')

  await mutate(SendFromNodeMutation, NodeAccount, { to: Buyer, value: '0.5' })
  log('Sent eth to buyer')

  await mutate(TransferTokenMutation, Admin, {
    to: Buyer,
    token: DAI,
    value: '500'
  })
  log('Sent DAI to buyer')

  await mutate(UpdateTokenAllowanceMutation, Buyer, {
    to: Marketplace,
    token: DAI,
    value: '500'
  })
  log('Set buyer dai token allowance')

  await mutate(SendFromNodeMutation, NodeAccount, {
    to: Arbitrator,
    value: '0.5'
  })
  log('Sent eth to arbitrator')

  await mutate(SendFromNodeMutation, NodeAccount, {
    to: Affiliate,
    value: '0.1'
  })
  log('Sent eth to affiliate')

  await mutate(AddAffiliateMutation, Admin, { affiliate: Affiliate })
  log('Added affiliate to marketplace')

  const IdentityEvents = await mutate(
    DeployIdentityEventsContractMutation,
    Admin
  )
  log(`Deployed Identity Events contract to ${IdentityEvents}`)

  await mutate(DeployIdentityMutation, Seller, {
    profile: {
      firstName: 'Stan',
      lastName: 'James',
      description: 'Hi from Stan',
      avatar: ''
    },
    attestations: []
  })
  log('Deployed Seller Identity')

  const UniswapFactory = await mutate(UniswapDeployFactory, Admin)
  log('Deployed Uniswap Factory to', UniswapFactory)

  const UniswapExchTpl = await mutate(UniswapDeployExchangeTemplate, Admin)
  log('Deployed Uniswap Exchange Template to', UniswapExchTpl)

  await mutate(UniswapInitFactory, Admin, {
    factory: UniswapFactory,
    exchange: UniswapExchTpl
  })
  log('Initialized Uniswap Factory')

  const UniswapDaiExchangeResult = await mutate(UniswapCreateExchange, Admin, {
    tokenAddress: DAI,
    factory: UniswapFactory
  })
  const NewExchangeEvent = UniswapDaiExchangeResult.events.find(
    e => e.event === 'NewExchange'
  )
  const UniswapDaiExchange = NewExchangeEvent.returnValuesArr.find(
    v => v.field === 'exchange'
  ).value
  log(`Created Uniswap Dai Exchange ${UniswapDaiExchange}`)

  await mutate(UpdateTokenAllowanceMutation, Admin, {
    token: DAI,
    to: UniswapDaiExchange,
    value: '100000'
  })
  log('Approved DAI on Uniswap Dai Exchange')

  await mutate(UniswapAddLiquidity, Admin, {
    exchange: UniswapDaiExchange,
    value: '1',
    tokens: '100000',
    liquidity: '0'
  })
  log('Added liquidity to Uniswap Dai Exchange')

  for (const listingVariables of demoListings) {
    await mutate(CreateListingMutation, Seller, listingVariables)
    log(`Deployed listing ${listingVariables.data.title}`)
  }

  await mutate(ToggleMetaMaskMutation, null, { enabled: true })
  log(`Enabled MetaMask`)

  if (done) {
    done({
      Admin,
      Seller,
      Buyer,
      Arbitrator,
      Affiliate,
      OGN,
      DAI,
      Marketplace,
      IdentityEvents,
      UniswapFactory,
      UniswapExchTpl,
      UniswapDaiExchange
    })
  }
}
