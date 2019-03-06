import gql from 'graphql-tag'
import fragments from './Fragments'

const AllGrowthCampaignsQuery = gql`
  query GrowthCampaigns($first: Int, $after: String) {
    campaigns(first: $first, after: $after) {
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
