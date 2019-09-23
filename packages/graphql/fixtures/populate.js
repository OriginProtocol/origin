import gql from 'graphql-tag'

import mnemonicToAccounts, {
  mnemonicToMasterAccount
} from '../src/utils/mnemonicToAccount'
import demoListings from './_demoListings'
import get from 'lodash/get'
import sortBy from 'lodash/sortBy'

import {
  ImportWalletsMutation,
  DeployTokenMutation,
  SendFromNodeMutation,
  TransferTokenMutation,
  DeployMarketplaceMutation,
  DeployProxyFactoryContractMutation,
  DeployIdentityProxyMutation,
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

async function getNodeAccount(gqlClient) {
  const NodeAcctsData = await gqlClient.query({ query: NodeAccountsQuery })
  const UnsortedAccts = get(NodeAcctsData, 'data.web3.nodeAccounts')
  const NodeAccountObj = sortBy(UnsortedAccts, a => -Number(a.balance.eth))[0]
  return NodeAccountObj.id
}

export async function createAccount(gqlClient, opts = {}) {
  const { ogn, dai, eth = '0.5', deployIdentity } = opts
  const NodeAccount = await getNodeAccount(gqlClient)
  await gqlClient.mutate({
    mutation: ToggleMetaMaskMutation,
    variables: { enabled: false }
  })
  const result = await gqlClient.mutate({
    mutation: CreateWalletMutation,
    variables: { name: 'Seller', role: 'Seller' }
  })
  const user = result.data.createWallet.id
  const sendTx = await gqlClient.mutate({
    mutation: SendFromNodeMutation,
    variables: { from: NodeAccount, to: user, value: eth }
  })
  await transactionConfirmed(sendTx.data.sendFromNode.id, gqlClient)

  if (deployIdentity) {
    const identity = await gqlClient.mutate({
      mutation: DeployIdentityMutation,
      variables: {
        from: user,
        profile: {
          firstName: 'Test',
          lastName: 'Account',
          description: 'Tester',
          avatar: ''
        },
        attestations: []
      }
    })
    await transactionConfirmed(identity.data.deployIdentity.id, gqlClient)
  }

  if (ogn) {
    const accounts = mnemonicToAccounts()
    await gqlClient.mutate({
      mutation: ImportWalletsMutation,
      variables: { accounts: [accounts[0]] }
    })

    const res = await gqlClient.mutate({
      mutation: TransferTokenMutation,
      variables: {
        from: '0x627306090abaB3A6e1400e9345bC60c78a8BEf57',
        to: user,
        token: 'OGN',
        value: ogn
      }
    })
    await transactionConfirmed(res.data.transferToken.id, gqlClient)
  }

  if (dai) {
    const accounts = mnemonicToAccounts()
    await gqlClient.mutate({
      mutation: ImportWalletsMutation,
      variables: { accounts: [accounts[0]] }
    })

    const res = await gqlClient.mutate({
      mutation: TransferTokenMutation,
      variables: {
        from: '0x627306090abaB3A6e1400e9345bC60c78a8BEf57',
        to: user,
        token: 'DAI',
        value: dai
      }
    })
    await transactionConfirmed(res.data.transferToken.id, gqlClient)
  }
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

  await mutate(SendFromNodeMutation, NodeAccount, { to: Admin, value: '0.5' })
  log('Sent eth to Admin')

  const OGN = await mutate(DeployTokenMutation, Admin, {
    type: 'OriginToken',
    name: 'Origin Token',
    symbol: 'OGN',
    decimals: '18',
    supply: '1000000000'
  })
  log(`Deployed Origin token to ${OGN.contractAddress}`)

  const DAI = await mutate(DeployTokenMutation, Admin, {
    type: 'Standard',
    name: 'Dai Stablecoin',
    symbol: 'DAI',
    decimals: '18',
    supply: '1000000000'
  })
  log(`Deployed DAI stablecoin to ${DAI.contractAddress}`)

  const MarketplaceV1 = await mutate(DeployMarketplaceMutation, Admin, {
    token: OGN.contractAddress,
    version: '001',
    autoWhitelist: true
  })
  log(`Deployed marketplace v1 to ${MarketplaceV1.contractAddress}`)

  await mutate(AddAffiliateMutation, Admin, {
    affiliate: Affiliate,
    version: '001'
  })
  log('Added affiliate to marketplace v1')

  const Marketplace = await mutate(DeployMarketplaceMutation, Admin, {
    token: OGN.contractAddress,
    version: '000',
    autoWhitelist: true
  })
  log(`Deployed marketplace v0 to ${Marketplace.contractAddress}`)

  await mutate(AddAffiliateMutation, Admin, {
    affiliate: Affiliate,
    version: '000'
  })
  log('Added affiliate to marketplace v0')

  const relayerMasterAddress = mnemonicToMasterAccount(
    process.env.FORWARDER_MNEMONIC || 'one two three four five six'
  )
  await mutate(SendFromNodeMutation, NodeAccount, {
    to: relayerMasterAddress,
    value: '3'
  })
  log(`Sent eth to Relayer master account(${relayerMasterAddress})`)

  const ProxyFactory = await mutate(DeployProxyFactoryContractMutation, Admin)
  log(`Deployed Proxy Factory to ${ProxyFactory.contractAddress}`)

  const IdentityProxy = await mutate(DeployIdentityProxyMutation, Admin)
  log(`Deployed Identity Proxy imp to ${IdentityProxy.contractAddress}`)

  await mutate(SendFromNodeMutation, NodeAccount, { to: Seller, value: '0.5' })
  log('Sent eth to seller')

  await mutate(TransferTokenMutation, Admin, {
    to: Seller,
    token: OGN.contractAddress,
    value: '500'
  })
  log('Sent ogn to seller')

  await mutate(UpdateTokenAllowanceMutation, Seller, {
    token: OGN.contractAddress,
    to: Marketplace.contractAddress,
    value: '500'
  })
  log('Set seller token allowance')

  await mutate(SendFromNodeMutation, NodeAccount, { to: Buyer, value: '0.5' })
  log('Sent eth to buyer')

  await mutate(TransferTokenMutation, Admin, {
    to: Buyer,
    token: DAI.contractAddress,
    value: '500'
  })
  log('Sent DAI to buyer')

  await mutate(UpdateTokenAllowanceMutation, Buyer, {
    to: Marketplace.contractAddress,
    token: DAI.contractAddress,
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

  const IdentityEvents = await mutate(
    DeployIdentityEventsContractMutation,
    Admin
  )
  log(`Deployed Identity Events contract to ${IdentityEvents.contractAddress}`)

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
  log('Deployed Uniswap Factory to', UniswapFactory.contractAddress)

  const UniswapExchTpl = await mutate(UniswapDeployExchangeTemplate, Admin)
  log('Deployed Uniswap Exchange Template to', UniswapExchTpl.contractAddress)

  await mutate(UniswapInitFactory, Admin, {
    factory: UniswapFactory.contractAddress,
    exchange: UniswapExchTpl.contractAddress
  })
  log('Initialized Uniswap Factory')

  const UniswapDaiExchangeResult = await mutate(UniswapCreateExchange, Admin, {
    tokenAddress: DAI.contractAddress,
    factory: UniswapFactory.contractAddress
  })
  const NewExchangeEvent = UniswapDaiExchangeResult.events.find(
    e => e.event === 'NewExchange'
  )
  const UniswapDaiExchange = NewExchangeEvent.returnValuesArr.find(
    v => v.field === 'exchange'
  ).value
  log(`Created Uniswap Dai Exchange ${UniswapDaiExchange}`)

  await mutate(UpdateTokenAllowanceMutation, Admin, {
    token: DAI.contractAddress,
    to: UniswapDaiExchange,
    value: '100000'
  })
  log('Approved DAI on Uniswap Dai Exchange')

  await mutate(SendFromNodeMutation, NodeAccount, { to: Admin, value: '1' })
  log('Sent eth to Admin')

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
      OGN: OGN.contractAddress,
      DAI: DAI.contractAddress,
      Marketplace: Marketplace.contractAddress,
      MarketplaceEpoch: Marketplace.blockNumber,
      Marketplace_V01: MarketplaceV1.contractAddress,
      MarketplaceEpoch_V01: MarketplaceV1.blockNumber,
      IdentityEvents: IdentityEvents.contractAddress,
      IdentityEventsEpoch: IdentityEvents.blockNumber,
      UniswapFactory: UniswapFactory.contractAddress,
      UniswapExchTpl: UniswapExchTpl.contractAddress,
      UniswapDaiExchange,
      ProxyFactory: ProxyFactory.contractAddress,
      IdentityProxyImplementation: IdentityProxy.contractAddress
    })
  }
}
