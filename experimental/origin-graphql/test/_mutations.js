import gql from 'graphql-tag'

const DeployToken = gql`
  mutation DeployToken(
    $name: String
    $symbol: String
    $decimals: String
    $supply: String
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

const DeployMarketplace = gql`
  mutation DeployMarketplace(
    $from: String
    $token: String
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

const AddAffiliate = gql`
  mutation AddAffiliate($from: String!, $affiliate: String!) {
    addAffiliate(from: $from, affiliate: $affiliate) {
      id
    }
  }
`

const CreateListing = gql`
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

const UpdateListing = gql`
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

const MakeOffer = gql`
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

const AcceptOffer = gql`
  mutation AcceptOffer($offerID: String!, $from: String) {
    acceptOffer(offerID: $offerID, from: $from) {
      id
    }
  }
`

const WithdrawOffer = gql`
  mutation WithdrawOffer($offerID: String!, $from: String) {
    withdrawOffer(offerID: $offerID, from: $from) {
      id
    }
  }
`

const FinalizeOffer = gql`
  mutation FinalizeOffer($offerID: String!, $from: String) {
    finalizeOffer(offerID: $offerID, from: $from) {
      id
    }
  }
`

const AddData = gql`
  mutation AddData($offerID: String!, $from: String, $data: String) {
    addData(offerID: $offerID, from: $from, data: $data) {
      id
    }
  }
`

const UpdateTokenAllowance = gql`
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

const TransferToken = gql`
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

export default {
  DeployToken,
  DeployMarketplace,
  CreateListing,
  MakeOffer,
  AcceptOffer,
  FinalizeOffer,
  AddData,
  UpdateTokenAllowance,
  TransferToken,
  AddAffiliate,
  WithdrawOffer,
  UpdateListing
}
