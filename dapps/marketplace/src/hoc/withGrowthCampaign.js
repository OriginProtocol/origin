import React from 'react'
import { Query } from 'react-apollo'
import QueryError from 'components/QueryError'
import get from 'lodash/get'

import enrollmentStatusQuery from 'queries/EnrollmentStatus'
import profileQuery from 'queries/Profile'
import allCampaignsQuery from 'queries/AllGrowthCampaigns'

function withGrowthCampaign(
  WrappedComponent,
  { useCache, queryEvenIfNotEnrolled, suppressErrors } = {}
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
              // enrollment info can change, do not cache it
              fetchPolicy={useCache ? 'cache-first' : 'network-only'}
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
                    // do not cache, so user does not need to refresh page when an
                    // action is completed. Except if cache explicitly requested
                    fetchPolicy={useCache ? 'cache-first' : 'network-only'}
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
