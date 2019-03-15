import React from 'react'
import { Query } from 'react-apollo'
import { fbt } from 'fbt-runtime'

//import allCampaignsQuery from 'queries/AllGrowthCampaigns'
import enrollmentStatusQuery from 'queries/EnrollmentStatus'
import profileQuery from 'queries/Profile'
import QueryError from 'components/QueryError'

import withEnrolmentModal from 'pages/growth/WithEnrolmentModal'

const EnrollButton = withEnrolmentModal('button')

const GrowthCampaignBox = props => (
  <Query query={profileQuery} notifyOnNetworkStatusChange={true}>
    {({ error, data, networkStatus, loading }) => {
      if (networkStatus === 1 || loading) {
        return ''
      } else if (error) {
        return <QueryError error={error} query={profileQuery} />
      }

      const walletAddress = data.web3.primaryAccount
        ? data.web3.primaryAccount.id
        : null
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
              return 'Loading...'
            } else if (error) {
              return <QueryError error={error} query={enrollmentStatusQuery} />
            }

            const notEnrolled = ['NotEnrolled', 'Banned'].includes(
              data.enrollmentStatus
            )

            return (
              <div className="growth-campaign-box">
                {notEnrolled && (
                  <div className="enroll-gray-box campaign-enroll d-flex flex-column align-items-center">
                    <fbt desc="profile.enrollExplanation">
                      <b>Enroll</b> to earn Origin cryptocurrency tokens (OGN).
                    </fbt>
                    <EnrollButton
                      className="btn-enroll mt-3"
                      type="submit"
                      skipjoincampaign="false"
                      urlforonboarding="/profile/onboard"
                      startopen={(props.openmodalonstart || false).toString()}
                    >
                      <fbt desc="profile.enrollButton">
                        <b>Enroll Now</b>
                      </fbt>
                    </EnrollButton>
                  </div>
                )}
                {!notEnrolled && (
                  <div className="enroll-gray-box">
                    TODO: implement enrolled graphic
                  </div>
                )}
              </div>
            )
          }}
        </Query>
      )
    }}
  </Query>
)

export default GrowthCampaignBox

require('react-styl')(`
  .growth-campaign-box
    .enroll-gray-box
      border: 1px solid var(--light)
      border-radius: var(--default-radius)
      padding: 1rem
      margin-bottom: 2rem
    .campaign-enroll
      font-size: 14px;
      background: url(images/growth/token-stack.svg) no-repeat center 1.5rem;
      background-size: 7rem;
      padding-top: 8rem;
    .btn-enroll
      font-size: 14px
      font-weight: 900
      color: var(--clear-blue)
      border: 0px
`)
