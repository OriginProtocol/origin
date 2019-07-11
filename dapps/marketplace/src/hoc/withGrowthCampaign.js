import React from 'react'
import { Query } from 'react-apollo'
import QueryError from 'components/QueryError'
import get from 'lodash/get'

import enrollmentStatusQuery from 'queries/EnrollmentStatus'
import allCampaignsQuery from 'queries/AllGrowthCampaigns'
import withWallet from './withWallet'

function withGrowthCampaign(
  WrappedComponent,
  { fetchPolicy = 'network-only', queryEvenIfNotEnrolled, suppressErrors } = {}
) {
  const WithGrowthCampaign = props => {
    return (
      <Query
        query={enrollmentStatusQuery}
        variables={{ walletAddress: props.wallet }}
        skip={!props.wallet}
        fetchPolicy={fetchPolicy}
      >
        {({ data, error, loading, networkStatus }) => {
          if (error && !suppressErrors) {
            return <QueryError error={error} query={enrollmentStatusQuery} />
          }

          const enrollmentStatus = get(data, 'enrollmentStatus')
          const walletLoading = !networkStatus || loading || networkStatus === 1
          return (
            <Query
              query={allCampaignsQuery}
              notifyOnNetworkStatusChange={true}
              skip={
                queryEvenIfNotEnrolled ? false : enrollmentStatus !== 'Enrolled'
              }
              fetchPolicy={fetchPolicy}
            >
              {({ data, error, loading, networkStatus }) => {
                if (error && !suppressErrors) {
                  return <QueryError error={error} query={allCampaignsQuery} />
                }

                return (
                  <WrappedComponent
                    {...props}
                    growthEnrollmentStatus={enrollmentStatus}
                    growthCampaigns={get(data, 'campaigns.nodes') || []}
                    growthCampaignsLoading={
                      !networkStatus ||
                      loading ||
                      networkStatus === 1 ||
                      walletLoading
                    }
                  />
                )
              }}
            </Query>
          )
        }}
      </Query>
    )
  }
  return withWallet(WithGrowthCampaign)
}

export default withGrowthCampaign
