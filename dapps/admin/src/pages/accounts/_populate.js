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
  CreateListingMutation
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

const walletAddress = ({ privateKey }) =>
  web3.eth.accounts.privateKeyToAccount(privateKey).address

export default async function populate(NodeAccount, gqlClient) {
  let hash
  const accounts = mnemonicToAccounts()
  await gqlClient.mutate({
    mutation: ImportWalletsMutation,
    variables: { accounts }
  })
  const Admin = walletAddress(accounts[0])
  const Seller = walletAddress(accounts[1])
  const Buyer = walletAddress(accounts[2])
  const Arbitrator = walletAddress(accounts[3])
  const Affiliate = walletAddress(accounts[4])

  hash = (await gqlClient.mutate({
    mutation: SendFromNodeMutation,
    variables: { to: Admin, from: NodeAccount, value: '0.5' }
  })).data.sendFromNode.id
  await transactionConfirmed(hash, gqlClient)
  console.log('Sent eth to Admin')

  hash = (await gqlClient.mutate({
    mutation: DeployTokenMutation,
    variables: {
      type: 'OriginToken',
      name: 'Origin Token',
      symbol: 'OGN',
      decimals: '18',
      supply: '1000000000',
      from: Admin
    }
  })).data.deployToken.id
  const OGN = (await transactionConfirmed(hash, gqlClient)).contractAddress
  console.log('Deployed token')

  hash = (await gqlClient.mutate({
    mutation: DeployTokenMutation,
    variables: {
      type: 'Standard',
      name: 'Dai Stablecoin',
      symbol: 'DAI',
      decimals: '18',
      supply: '1000000000',
      from: Admin
    }
  })).data.deployToken.id
  const DAI = (await transactionConfirmed(hash, gqlClient)).contractAddress
  console.log('Deployed DAI stablecoin')

  hash = (await gqlClient.mutate({
    mutation: DeployMarketplaceMutation,
    variables: { token: OGN, version: '001', autoWhitelist: true, from: Admin }
  })).data.deployMarketplace.id
  const Marketplace = (await transactionConfirmed(hash, gqlClient))
    .contractAddress
  console.log('Deployed marketplace')

  hash = (await gqlClient.mutate({
    mutation: SendFromNodeMutation,
    variables: { to: Seller, from: NodeAccount, value: '0.5' }
  })).data.sendFromNode.id
  await transactionConfirmed(hash, gqlClient)
  console.log('Sent eth to seller')

  hash = (await gqlClient.mutate({
    mutation: TransferTokenMutation,
    variables: { token: OGN, to: Seller, from: Admin, value: '500' }
  })).data.transferToken.id
  await transactionConfirmed(hash, gqlClient)
  console.log('Sent ogn to seller')

  hash = (await gqlClient.mutate({
    mutation: UpdateTokenAllowanceMutation,
    variables: { token: 'ogn', to: Marketplace, from: Seller, value: '500' }
  })).data.updateTokenAllowance.id
  await transactionConfirmed(hash, gqlClient)
  console.log('Set seller token allowance')

  hash = (await gqlClient.mutate({
    mutation: SendFromNodeMutation,
    variables: { to: Buyer, from: NodeAccount, value: '0.5' }
  })).data.sendFromNode.id
  await transactionConfirmed(hash, gqlClient)
  console.log('Sent eth to buyer')

  hash = (await gqlClient.mutate({
    mutation: TransferTokenMutation,
    variables: { token: DAI, to: Buyer, from: Admin, value: '500' }
  })).data.transferToken.id
  await transactionConfirmed(hash, gqlClient)
  console.log('Sent DAI to buyer')

  hash = (await gqlClient.mutate({
    mutation: UpdateTokenAllowanceMutation,
    variables: { token: DAI, to: Marketplace, from: Buyer, value: '500' }
  })).data.updateTokenAllowance.id
  await transactionConfirmed(hash, gqlClient)
  console.log('Set buyer dai token allowance')

  hash = (await gqlClient.mutate({
    mutation: SendFromNodeMutation,
    variables: { to: Arbitrator, from: NodeAccount, value: '0.5' }
  })).data.sendFromNode.id
  await transactionConfirmed(hash, gqlClient)
  console.log('Sent eth to arbitrator')

  hash = (await gqlClient.mutate({
    mutation: SendFromNodeMutation,
    variables: { to: Affiliate, from: NodeAccount, value: '0.1' }
  })).data.sendFromNode.id
  await transactionConfirmed(hash, gqlClient)
  console.log('Sent eth to affiliate')

  hash = (await gqlClient.mutate({
    mutation: AddAffiliateMutation,
    variables: { affiliate: Affiliate, from: Admin }
  })).data.addAffiliate.id
  await transactionConfirmed(hash, gqlClient)
  console.log('Added affiliate to marketplace')

  hash = (await gqlClient.mutate({
    mutation: DeployIdentityEventsContractMutation,
    variables: { from: Admin }
  })).data.deployIdentityEvents.id
  await transactionConfirmed(hash, gqlClient)
  console.log('Deployed Identity Events contract')

  hash = (await gqlClient.mutate({
    mutation: DeployIdentityMutation,
    variables: {
      from: Seller,
      attestations: [],
      profile: {
        firstName: 'Stan',
        lastName: 'James',
        description: 'Hi from Stan',
        avatar: ''
      }
    }
  })).data.deployIdentity.id
  await transactionConfirmed(hash, gqlClient)
  console.log('Deployed Seller Identity')

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
    hash = (await gqlClient.mutate({
      mutation: CreateListingMutation,
      variables: {
        deposit: '5',
        depositManager: Arbitrator,
        from: Seller,
        autoApprove: true,
        data: listingData,
        unitData: {
          unitsTotal: listing.unitsTotal
        }
      }
    })).data.createListing.id
    await transactionConfirmed(hash, gqlClient)
    console.log('Deployed Listing')
  }
}
