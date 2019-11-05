import React from 'react'
import { Query } from 'react-apollo'
import { fbt } from 'fbt-runtime'
import { withRouter } from 'react-router-dom'

import get from 'lodash/get'

import AccountTokenBalance from 'queries/TokenBalance'
import QueryError from 'components/QueryError'

import withGrowthCampaign from 'hoc/withGrowthCampaign'
import profileQuery from 'queries/Profile'
import ProgressBar from 'components/ProgressBar'
import Link from 'components/Link'
import formatTimeDifference from 'utils/formatTimeDifference'

//TODO: put this into constants
const maxProgressBarTokens = 2500

const renderEnrolledBox = (props, walletAddress) => {
  const campaigns = props.growthCampaigns
  if (!campaigns || campaigns.length === 0) {
    return (
      <h5 className="p-2">
        <fbt desc="growthCampaignBox.noCampaignsDetected">
          No campaigns detected
        </fbt>
      </h5>
    )
  }
  const activeCampaign = campaigns.find(
    campaign => campaign.status === 'Active'
  )

  if (activeCampaign === null) {
    return (
      <fbt desc="growthCampaignBox.noActiveCampaignFound">
        No active campaign found
      </fbt>
    )
  }

  return (
    <Query
      query={AccountTokenBalance}
      variables={{ account: walletAddress, token: 'OGN' }}
    >
      {({ loading, error, data }) => {
        let decimalDivision = web3.utils.toBN(10).pow(web3.utils.toBN(18))

        if (!loading && !error) {
          const tokenHolder = data.web3.account.token
          if (tokenHolder && tokenHolder.token) {
            decimalDivision = web3.utils
              .toBN(10)
              .pow(web3.utils.toBN(tokenHolder.token.decimals))
          }
        }
        const { rewardEarned, endDate } = activeCampaign
        const tokensEarned = web3.utils
          .toBN(rewardEarned ? rewardEarned.amount : 0)
          .div(decimalDivision)
        const tokenEarnProgress = Math.min(
          maxProgressBarTokens,
          tokensEarned.toString()
        )

        const timeLeft = formatTimeDifference(Date.now(), endDate)

        return (
          <>
            <h3>
              <fbt desc="profile.growthCampaignEarning">Campaign Earnings</fbt>
            </h3>
            <div className="mt-2">
              <img className="ogn-icon pr-2" src="images/ogn-icon.svg" />
              <span className="ogn-amount font-weight-bold big">
                {tokensEarned.toString()}
              </span>
              <span className="ogn-amount font-weight-bold small ml-1">
                OGN
              </span>
            </div>
            <ProgressBar
              maxValue={maxProgressBarTokens}
              progress={tokenEarnProgress}
              showIndicators={false}
            />
            <div className="time-left">
              {fbt(
                `Time left: ${fbt.param('timeLeft', timeLeft)}`,
                'profile.campaignTimeLeft'
              )}
            </div>
            <div className="help">
              <fbt desc="profile.growthPaidOut">
                Paid out after campaign is finished
              </fbt>
            </div>
            <Link to="/campaigns">
              <fbt desc="Profile.visitCampaignHome">Visit Campaign Home</fbt>{' '}
              &gt;
            </Link>
          </>
        )
      }}
    </Query>
  )
}

const GrowthCampaignBox = props => (
  <Query query={profileQuery} notifyOnNetworkStatusChange={true}>
    {({ error, data, networkStatus, loading }) => {
      if (networkStatus === 1 || loading) {
        return null
      } else if (error) {
        return <QueryError error={error} query={profileQuery} />
      }

      let notEnrolled = true
      if (props.growthEnrollmentStatus) {
        notEnrolled = ['NotEnrolled', 'Banned'].includes(
          props.growthEnrollmentStatus
        )
      }

      if (notEnrolled) {
        return null
      }

      const walletAddress = get(data, 'web3.primaryAccount.id')

      return (
        <div className="growth-campaign-box">
          {renderEnrolledBox(props, walletAddress)}
        </div>
      )
    }}
  </Query>
)

export default withRouter(withGrowthCampaign(GrowthCampaignBox))

require('react-styl')(`
  .growth-campaign-box
    border-radius: 5px
    border: solid 1px var(--pale-grey-two)
    background-color: var(--pale-grey-four)
    margin: 1rem 0
    padding: 1.5rem
    h3
      font-family: Lato
      font-size: 0.8rem
      color: var(--dark)
      font-weight: 500
    a
      font-size: 0.75rem
      font-weight: normal
      font-family: Lato
      color: var(--clear-blue)
    .help
      font-weight: normal
      font-size: 0.75rem
      color: #6f8294
      margin-bottom: 1rem
    .time-left
      font-weight: normal
      font-size: 0.75rem
      margin-bottom: 0.5rem
      margin-top: 1rem
    .ogn-icon
      position: relative
      top: -3px
    .ogn-amount
      color: var(--clear-blue)
`)
