
import React from 'react'
import { useQuery } from 'react-apollo'
import get from 'lodash/get'

import ActiveGrowthCampaignQuery from 'queries/ActiveGrowthCampaign'

function withActiveGrowthCampaign(WrappedComponent) {
  const WithActiveGrowthCampaign = props => {
    const { data, loading, networkStatus } = useQuery(ActiveGrowthCampaignQuery, {
      notifyOnNetworkStatusChange: true,
      fetchPolicy: 'network-only'
    })

    return (
      <WrappedComponent
        {...props}
        activeGrowthCampaign={get(data, 'campaign') || []}
        activeGrowthCampaignLoading={loading || networkStatus === 1}
      />
    )
  }
  return WithActiveGrowthCampaign
}

export default withActiveGrowthCampaign
