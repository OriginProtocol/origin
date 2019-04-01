import gql from 'graphql-tag'

import mnemonicToAccounts from 'utils/mnemonicToAccounts'
import demoListings from '../marketplace/mutations/_demoListings'

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
  UniswapDeployFactory,
  UniswapDeployExchangeTemplate,
  UniswapInitFactory,
  UniswapCreateExchange,
  UniswapAddLiquidity
} from 'queries/Mutations'

const TransactionSubscription = gql`
  subscription onTransactionUpdated {
    transactionUpdated {
      id
      status
      mutation
      confirmations
    }
  }
`

function transactionConfirmed(hash, gqlClient) {
  return new Promise(resolve => {
    const sub = gqlClient
      .subscribe({
        query: TransactionSubscription
      })
      .subscribe({
        next: async result => {
          const t = result.data.transactionUpdated
          if (t.id === hash && t.status === 'receipt') {
            sub.unsubscribe()
            const result = await web3.eth.getTransactionReceipt(hash)
            resolve(result)
          }
        }
      })
  })
}

export default async function populate(NodeAccount, gqlClient) {
  async function mutate(mutation, from, variables = {}) {
    variables.from = from
    const result = await gqlClient.mutate({ mutation, variables })
    const key = Object.keys(result.data)[0]
    const hash = result.data[key].id
    if (hash) {
      const transaction = await transactionConfirmed(hash, gqlClient)
      return transaction.contractAddress || transaction
    }
    return result.data[key]
  }

  const accounts = mnemonicToAccounts()
  await mutate(ImportWalletsMutation, Admin, { accounts })
  const [Admin, Seller, Buyer, Arbitrator, Affiliate] = accounts.map(
    account => web3.eth.accounts.privateKeyToAccount(account.privateKey).address
  )

  await mutate(SendFromNodeMutation, NodeAccount, { to: Admin, value: '0.5' })
  console.log('Sent eth to Admin')

  const OGN = await mutate(DeployTokenMutation, Admin, {
    type: 'OriginToken',
    name: 'Origin Token',
    symbol: 'OGN',
    decimals: '18',
    supply: '1000000000'
  })
  console.log('Deployed Origin token to', OGN)

  const DAI = await mutate(DeployTokenMutation, Admin, {
    type: 'Standard',
    name: 'Dai Stablecoin',
    symbol: 'DAI',
    decimals: '18',
    supply: '1000000000'
  })
  console.log('Deployed DAI stablecoin to', DAI)

  const Marketplace = await mutate(DeployMarketplaceMutation, Admin, {
    token: OGN,
    version: '001',
    autoWhitelist: true
  })
  console.log('Deployed marketplace to', Marketplace)

  await mutate(SendFromNodeMutation, NodeAccount, { to: Seller, value: '0.5' })
  console.log('Sent eth to seller')

  await mutate(TransferTokenMutation, Admin, {
    to: Seller,
    token: OGN,
    value: '500'
  })
  console.log('Sent ogn to seller')

  await mutate(UpdateTokenAllowanceMutation, Seller, {
    token: 'ogn',
    to: Marketplace,
    value: '500'
  })
  console.log('Set seller token allowance')

  await mutate(SendFromNodeMutation, NodeAccount, { to: Buyer, value: '0.5' })
  console.log('Sent eth to buyer')

  await mutate(TransferTokenMutation, Admin, {
    to: Buyer,
    token: DAI,
    value: '500'
  })
  console.log('Sent DAI to buyer')

  await mutate(UpdateTokenAllowanceMutation, Buyer, {
    to: Marketplace,
    token: DAI,
    value: '500'
  })
  console.log('Set buyer dai token allowance')

  await mutate(SendFromNodeMutation, NodeAccount, {
    to: Arbitrator,
    value: '0.5'
  })
  console.log('Sent eth to arbitrator')

  await mutate(SendFromNodeMutation, NodeAccount, {
    to: Affiliate,
    value: '0.1'
  })
  console.log('Sent eth to affiliate')

  await mutate(AddAffiliateMutation, Admin, { affiliate: Affiliate })
  console.log('Added affiliate to marketplace')

  const IE = await mutate(DeployIdentityEventsContractMutation, Admin)
  console.log('Deployed Identity Events contract to', IE)

  await mutate(DeployIdentityMutation, Seller, {
    profile: {
      firstName: 'Stan',
      lastName: 'James',
      description: 'Hi from Stan',
      avatar: ''
    },
    attestations: []
  })
  console.log('Deployed Seller Identity')

  const UniswapFactory = await mutate(UniswapDeployFactory, Admin)
  console.log('Deployed Uniswap Factory to', UniswapFactory)

  await mutate(UniswapDeployExchangeTemplate, Admin)
  console.log('Deployed Uniswap Exhange Template')

  await mutate(UniswapInitFactory, Admin)
  console.log('Initialized Uniswap Factory')

  await mutate(UniswapCreateExchange, Admin, { tokenAddress: DAI })
  console.log('Created Uniswap Dai Exchange', localStorage.uniswapDaiExchange)

  await mutate(UpdateTokenAllowanceMutation, Admin, {
    token: 'token-DAI',
    to: localStorage.uniswapDaiExchange,
    value: '100000'
  })
  console.log('Approved DAI on Uniswap Dai Exchange')

  await mutate(UniswapAddLiquidity, Admin, {
    exchange: localStorage.uniswapDaiExchange,
    value: '1',
    tokens: '100000',
    liquidity: '0'
  })
  console.log('Added liquidity to Uniswap Dai Exchange')

  for (const listing of demoListings) {
    const commissionPerUnit = listing.commissionPerUnit || '0'
    const listingData = {
      title: listing.title,
      description: listing.description,
      price: listing.price,
      acceptedTokens: listing.acceptedTokens,
      category: listing.category,
      subCategory: listing.subCategory,
      media: listing.media,
      commissionPerUnit,
      commission: listing.commission ? listing.commission.amount : '0'
    }
    if (listing.marketplacePublisher) {
      listingData.marketplacePublisher = listing.marketplacePublisher
    }
    await mutate(CreateListingMutation, Seller, {
      deposit: '5',
      depositManager: Arbitrator,
      from: Seller,
      autoApprove: true,
      data: listingData,
      unitData: {
        unitsTotal: listing.unitsTotal
      }
    })
    console.log('Deployed listing', listingData.title)
  }
}
