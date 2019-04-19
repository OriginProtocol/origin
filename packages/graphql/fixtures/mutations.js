import gql from 'graphql-tag'

export const RefetchMutation = gql`
  mutation Refetch {
    refetch
  }
`

export const AddAffiliateMutation = gql`
  mutation AddAffiliate($affiliate: String!, $from: String) {
    addAffiliate(affiliate: $affiliate, from: $from) {
      id
    }
  }
`

export const CreateWalletMutation = gql`
  mutation CreateWallet($role: String, $name: String) {
    createWallet(role: $role, name: $name) {
      id
      role
      name
    }
  }
`

export const ImportWalletMutation = gql`
  mutation ImportWallet($role: String, $name: String, $privateKey: String!) {
    importWallet(role: $role, name: $name, privateKey: $privateKey) {
      id
      role
      name
    }
  }
`

export const ImportWalletsMutation = gql`
  mutation ImportWallets($accounts: [WalletInput]!) {
    importWallets(accounts: $accounts) {
      id
    }
  }
`

export const DeployTokenMutation = gql`
  mutation DeployToken(
    $name: String!
    $symbol: String!
    $decimals: String!
    $supply: String!
    $type: String
    $from: String
  ) {
    deployToken(
      name: $name
      symbol: $symbol
      decimals: $decimals
      supply: $supply
      type: $type
      from: $from
    ) {
      id
    }
  }
`

export const SendFromNodeMutation = gql`
  mutation SendFromNode($from: String!, $to: String!, $value: String!) {
    sendFromNode(from: $from, to: $to, value: $value) {
      id
    }
  }
`

export const SendFromWalletMutation = gql`
  mutation SendFromWallet($from: String, $to: String, $value: String) {
    sendFromWallet(from: $from, to: $to, value: $value) {
      id
    }
  }
`

export const TransferTokenMutation = gql`
  mutation TransferToken(
    $token: String!
    $from: String!
    $to: String!
    $value: String!
  ) {
    transferToken(token: $token, from: $from, to: $to, value: $value) {
      id
    }
  }
`

export const UpdateTokenAllowanceMutation = gql`
  mutation UpdateTokenAllowance(
    $token: String!
    $from: String!
    $to: String!
    $value: String!
  ) {
    updateTokenAllowance(token: $token, from: $from, to: $to, value: $value) {
      id
    }
  }
`

export const DeployMarketplaceMutation = gql`
  mutation DeployMarketplace(
    $from: String
    $token: String!
    $version: String
    $autoWhitelist: Boolean
  ) {
    deployMarketplace(
      from: $from
      token: $token
      version: $version
      autoWhitelist: $autoWhitelist
    ) {
      id
    }
  }
`

export const DeployIdentityContractMutation = gql`
  mutation DeployIdentityContract($from: String!, $contract: String!) {
    deployIdentityContract(from: $from, contract: $contract) {
      id
    }
  }
`

export const DeployIdentityEventsContractMutation = gql`
  mutation DeployIdentityEventsContract($from: String!) {
    deployIdentityEvents(from: $from) {
      id
    }
  }
`

export const CreateListingMutation = gql`
  mutation CreateListing(
    $from: String!
    $deposit: String
    $depositManager: String
    $autoApprove: Boolean
    $data: ListingInput!
    $unitData: UnitListingInput
    $fractionalData: FractionalListingInput
  ) {
    createListing(
      from: $from
      deposit: $deposit
      depositManager: $depositManager
      autoApprove: $autoApprove
      data: $data
      unitData: $unitData
      fractionalData: $fractionalData
    ) {
      id
    }
  }
`

export const UpdateListingMutation = gql`
  mutation UpdateListing(
    $listingID: ID!
    $from: String!
    $additionalDeposit: String
    $autoApprove: Boolean
    $data: ListingInput!
    $unitData: UnitListingInput
    $fractionalData: FractionalListingInput
  ) {
    updateListing(
      listingID: $listingID
      from: $from
      additionalDeposit: $additionalDeposit
      autoApprove: $autoApprove
      data: $data
      unitData: $unitData
      fractionalData: $fractionalData
    ) {
      id
    }
  }
`

export const WithdrawListingMutation = gql`
  mutation WithdrawListing(
    $listingID: String!
    $target: String!
    $reason: String
    $from: String
  ) {
    withdrawListing(
      listingID: $listingID
      target: $target
      reason: $reason
      from: $from
    ) {
      id
    }
  }
`

export const MakeOfferMutation = gql`
  mutation MakeOffer(
    $listingID: String
    $finalizes: Int
    $affiliate: String
    $commission: String
    $value: String
    $currency: String
    $arbitrator: String
    $data: MakeOfferInput
    $from: String
    $withdraw: String
    $quantity: Int
  ) {
    makeOffer(
      listingID: $listingID
      finalizes: $finalizes
      affiliate: $affiliate
      commission: $commission
      value: $value
      currency: $currency
      arbitrator: $arbitrator
      data: $data
      from: $from
      withdraw: $withdraw
      quantity: $quantity
    ) {
      id
    }
  }
`

export const AcceptOfferMutation = gql`
  mutation AcceptOffer($offerID: String!, $from: String) {
    acceptOffer(offerID: $offerID, from: $from) {
      id
    }
  }
`

export const AddFundsMutation = gql`
  mutation AddFunds($offerID: String!, $amount: String!, $from: String) {
    addFunds(offerID: $offerID, amount: $amount, from: $from) {
      id
    }
  }
`

export const UpdateRefundMutation = gql`
  mutation UpdateRefundMutation(
    $offerID: String!
    $amount: String!
    $from: String
  ) {
    updateRefund(offerID: $offerID, amount: $amount, from: $from) {
      id
    }
  }
`

export const ExecuteRulingMutation = gql`
  mutation ExecuteRulingMutation(
    $offerID: String!
    $ruling: String!
    $commission: String!
    $message: String
    $refund: String
    $from: String
  ) {
    executeRuling(
      offerID: $offerID
      amount: $amount
      ruling: $ruling
      commission: $commission
      message: $message
      refund: $refund
      from: $from
    ) {
      id
    }
  }
`

export const FinalizeOfferMutation = gql`
  mutation FinalizeOffer($offerID: String!, $from: String) {
    finalizeOffer(offerID: $offerID, from: $from) {
      id
    }
  }
`

export const DisputeOfferMutation = gql`
  mutation DisputeOffer($offerID: String, $from: String) {
    disputeOffer(offerID: $offerID, from: $from) {
      id
    }
  }
`

export const WithdrawOfferMutation = gql`
  mutation WithdrawOffer($offerID: String, $from: String) {
    withdrawOffer(offerID: $offerID, from: $from) {
      id
    }
  }
`

export const AddDataMutation = gql`
  mutation WithdrawListing(
    $data: String!
    $from: String!
    $listingID: String
    $offerID: String
  ) {
    addData(
      data: $data
      listingID: $listingID
      offerID: $offerID
      from: $from
    ) {
      id
    }
  }
`

export const DeployIdentityMutation = gql`
  mutation DeployIdentity(
    $from: String!
    $profile: ProfileInput
    $attestations: [String]
  ) {
    deployIdentity(
      from: $from
      attestations: $attestations
      profile: $profile
    ) {
      id
    }
  }
`

export const UniswapDeployFactory = gql`
  mutation UniswapDeployFactory($from: String!) {
    uniswapDeployFactory(from: $from) {
      id
    }
  }
`

export const UniswapDeployExchangeTemplate = gql`
  mutation UniswapExchangeTemplate($from: String!) {
    uniswapDeployExchangeTemplate(from: $from) {
      id
    }
  }
`

export const UniswapInitFactory = gql`
  mutation UniswapInitFactory(
    $from: String!
    $exchange: String
    $factory: String
  ) {
    uniswapInitializeFactory(
      from: $from
      exchange: $exchange
      factory: $factory
    ) {
      id
    }
  }
`

export const UniswapCreateExchange = gql`
  mutation UniswapCreateExchange(
    $from: String!
    $tokenAddress: String!
    $factory: String
  ) {
    uniswapCreateExchange(
      from: $from
      tokenAddress: $tokenAddress
      factory: $factory
    ) {
      id
    }
  }
`

export const UniswapAddLiquidity = gql`
  mutation UniswapAddLiquidity(
    $from: String!
    $exchange: String!
    $value: String!
    $tokens: String!
    $liquidity: String!
  ) {
    uniswapAddLiquidity(
      from: $from
      exchange: $exchange
      value: $value
      tokens: $tokens
      liquidity: $liquidity
    ) {
      id
    }
  }
`

export const ToggleMetaMaskMutation = gql`
  mutation ToggleMetaMask($enabled: Boolean) {
    toggleMetaMask(enabled: $enabled)
  }
`
