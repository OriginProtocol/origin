import React from 'react'
import { Query } from 'react-apollo'
import QueryError from 'components/QueryError'
import get from 'lodash/get'

import enrollmentStatusQuery from 'queries/EnrollmentStatus'
import profileQuery from 'queries/Profile'
import allCampaignsQuery from 'queries/AllGrowthCampaigns'

function withGrowthCampaign(
  WrappedComponent,
  { fetchPolicy = 'network-only', queryEvenIfNotEnrolled, suppressErrors } = {}
) {
  const WithGrowthCampaign = props => {
    return (
      <Query query={profileQuery} notifyOnNetworkStatusChange={true}>
        {({ data, error }) => {
          if (error && !suppressErrors) {
            return <QueryError error={error} query={profileQuery} />
          }

          const walletAddress = get(data, 'web3.primaryAccount.id')

          return (
            <Query
              query={enrollmentStatusQuery}
              variables={{ walletAddress }}
              skip={!walletAddress}
              fetchPolicy={fetchPolicy}
            >
              {({ data, error }) => {
                if (error && !suppressErrors) {
                  return (
                    <QueryError error={error} query={enrollmentStatusQuery} />
                  )
                }

                const enrollmentStatus = get(data, 'enrollmentStatus')
                return (
                  <Query
                    query={allCampaignsQuery}
                    notifyOnNetworkStatusChange={true}
                    skip={
                      queryEvenIfNotEnrolled
                        ? false
                        : enrollmentStatus !== 'Enrolled'
                    }
                    fetchPolicy={fetchPolicy}
                  >
                    {({ data, error }) => {
                      if (error && !suppressErrors) {
                        return (
                          <QueryError error={error} query={allCampaignsQuery} />
                        )
                      }

                      return (
                        <WrappedComponent
                          {...props}
                          growthEnrollmentStatus={enrollmentStatus}
                          growthCampaigns={get(data, 'campaigns.nodes') || []}
                        />
                      )
                    }}
                  </Query>
                )
              }}
            </Query>
          )
        }}
      </Query>
    )
  }
  return WithGrowthCampaign
}

export default withGrowthCampaign
