import React from 'react'
import { Query } from 'react-apollo'
import QueryError from 'components/QueryError'
import get from 'lodash/get'

import allCampaignsQuery from 'queries/AllGrowthCampaigns'
import withEnrolmentStatus from './withEnrolmentStatus'

function withGrowthCampaign(
  WrappedComponent,
  { fetchPolicy = 'network-only', queryEvenIfNotEnrolled, suppressErrors } = {}
) {
  const WithGrowthCampaign = props => {
    return (
      <Query
        query={allCampaignsQuery}
        notifyOnNetworkStatusChange={true}
        skip={
          queryEvenIfNotEnrolled
            ? false
            : props.growthEnrollmentStatus !== 'Enrolled'
        }
        fetchPolicy={fetchPolicy}
      >
        {({ data, error, loading, networkStatus, refetch }) => {
          if (error && !suppressErrors) {
            return <QueryError error={error} query={allCampaignsQuery} />
          }

          return (
            <WrappedComponent
              {...props}
              growthCampaigns={get(data, 'campaigns.nodes') || []}
              growthCampaignsLoading={
                !networkStatus ||
                loading ||
                networkStatus === 1 ||
                props.growthEnrollmentStatusLoading
              }
              growthCampaignsRefetch={refetch}
            />
          )
        }}
      </Query>
    )
  }
  return withEnrolmentStatus(WithGrowthCampaign)
}

export default withGrowthCampaign
