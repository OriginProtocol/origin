import gql from 'graphql-tag'

import mnemonicToAccounts from '../src/utils/mnemonicToAccount'
import demoListings from './_demoListings'

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

function transactionConfirmed(hash, gqlClient) {
  return new Promise(resolve => {
    const sub = gqlClient.subscribe({ query }).subscribe({
      next: async result => {
        const t = result.data.transactionUpdated
        if (t.id === hash && t.status === 'receipt') {
          sub.unsubscribe()
          const result = await web3.eth.getTransactionReceipt(hash) // eslint-disable-line
          resolve(result)
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

export default async function populate(gqlClient, NodeAccount, log, done) {
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

  await mutate(ToggleMetaMaskMutation, null, { enabled: false })
  log(`Disabled MetaMask`)

  const accounts = mnemonicToAccounts()
  await mutate(ImportWalletsMutation, null, { accounts })
  const [Admin, Seller, Buyer, Arbitrator, Affiliate] = accounts.map(
    account => web3.eth.accounts.privateKeyToAccount(account.privateKey).address // eslint-disable-line
  )

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
    token: 'ogn',
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

  const IE = await mutate(DeployIdentityEventsContractMutation, Admin)
  log(`Deployed Identity Events contract to ${IE}`)

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

  await mutate(UniswapDeployExchangeTemplate, Admin)
  log('Deployed Uniswap Exhange Template')

  await mutate(UniswapInitFactory, Admin)
  log('Initialized Uniswap Factory')

  await mutate(UniswapCreateExchange, Admin, { tokenAddress: DAI })
  log(`Created Uniswap Dai Exchange ${localStorage.uniswapDaiExchange}`)

  await mutate(UpdateTokenAllowanceMutation, Admin, {
    token: 'token-DAI',
    to: localStorage.uniswapDaiExchange,
    value: '100000'
  })
  log('Approved DAI on Uniswap Dai Exchange')

  await mutate(UniswapAddLiquidity, Admin, {
    exchange: localStorage.uniswapDaiExchange,
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
    done()
  }
}
