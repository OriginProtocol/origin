import React from 'react'
import { Query } from 'react-apollo'
import QueryError from 'components/QueryError'
import get from 'lodash/get'

import enrollmentStatusQuery from 'queries/EnrollmentStatus'
import profileQuery from 'queries/Profile'
import allCampaignsQuery from 'queries/AllGrowthCampaigns'

function withGrowthCampaign(WrappedComponent) {
  const WithGrowthCampaign = props => {
    return (
      <Query query={profileQuery} notifyOnNetworkStatusChange={true}>
        {({ error, data, networkStatus, loading }) => {
          if (networkStatus === 1 || loading || !data.web3) {
            return <WrappedComponent {...props} />
          } else if (error) {
            return <QueryError error={error} query={profileQuery} />
          }

          const walletAddress = get(data, 'web3.primaryAccount.id')

          return (
            <Query
              query={enrollmentStatusQuery}
              variables={{
                walletAddress: walletAddress ? walletAddress : '0xdummyAddress'
              }}
              // enrollment info can change, do not cache it
              fetchPolicy="network-only"
            >
              {({ networkStatus, error, loading, data }) => {
                if (networkStatus === 1 || loading) {
                  return <WrappedComponent {...props} />
                } else if (error) {
                  return (
                    <QueryError error={error} query={enrollmentStatusQuery} />
                  )
                }

                const enrollmentStatus = data.enrollmentStatus
                if (enrollmentStatus !== 'Enrolled') {
                  return (
                    <WrappedComponent
                      {...props}
                      growthEnrollmentStatus={enrollmentStatus}
                    />
                  )
                }

                return (
                  <Query
                    query={allCampaignsQuery}
                    notifyOnNetworkStatusChange={true}
                    // do not cache, so user does not need to refresh page when an
                    // action is completed
                    fetchPolicy="network-only"
                  >
                    {({ networkStatus, error, loading, data }) => {
                      if (networkStatus === 1 || loading) {
                        return <WrappedComponent {...props} />
                      } else if (error) {
                        return (
                          <QueryError error={error} query={allCampaignsQuery} />
                        )
                      }

                      return (
                        <WrappedComponent
                          {...props}
                          growthEnrollmentStatus={enrollmentStatus}
                          growthCampaigns={data.campaigns.nodes}
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
