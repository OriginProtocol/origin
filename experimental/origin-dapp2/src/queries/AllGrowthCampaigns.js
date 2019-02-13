import gql from 'graphql-tag'
import fragments from './Fragments'

const AllGrowthCampaignsQuery = gql`
  query GrowthCampaigns($first: Int, $after: String, $walletAddress: ID) {
    campaigns(first: $first, after: $after, walletAddress: $walletAddress) {
      totalCount
      pageInfo {
        hasNextPage
        hasPreviousPage
        endCursor
      }
      nodes {
        ...basicCampaignFields
      }
    }
  }
  ${fragments.GrowthCampaign.basic}
`

export default AllGrowthCampaignsQuery
