import gql from 'graphql-tag'
import fragments from './Fragments'

const ActiveGrowthCampaignQuery = gql`
  query GrowthCampaigns($id: String = "active") {
    campaign(id:$id) {
      ...basicCampaignFields
    }
  }
  ${fragments.GrowthCampaign.basic}
`

export default ActiveGrowthCampaignQuery
