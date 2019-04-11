import React from 'react'
import { Query } from 'react-apollo'
import { fbt } from 'fbt-runtime'
import { withRouter } from 'react-router-dom'

import AccountTokenBalance from 'queries/TokenBalance'
import QueryError from 'components/QueryError'

import withGrowthCampaign from 'hoc/withGrowthCampaign'
import profileQuery from 'queries/Profile'
import withEnrolmentModal from 'pages/growth/WithEnrolmentModal'
import ProgressBar from 'components/ProgressBar'
import formatTimeDifference from 'utils/formatTimeDifference'

const EnrollButton = withEnrolmentModal('button')
//TODO: put this into constants
const maxProgressBarTokens = 1000

const renderNotEnrolledBox = openmodalonstart => {
  return (
    <div className="enroll-gray-box campaign-enroll d-flex flex-column align-items-center">
      <fbt desc="profile.enrollExplanation">
        <b>Enroll</b> to earn Origin cryptocurrency tokens (OGN).
      </fbt>
      <EnrollButton
        className="btn-enroll mt-3"
        type="submit"
        skipjoincampaign="false"
        urlforonboarding="/profile/onboard"
        startopen={(openmodalonstart || false).toString()}
      >
        <fbt desc="profile.enrollButton">
          <b>Enroll Now</b>
        </fbt>
      </EnrollButton>
    </div>
  )
}

const renderEnrolledBox = (props, walletAddress) => {
  const campaigns = props.growthCampaigns
  if (campaigns.length == 0) {
    return <h5 className="p-2">No campaigns detected</h5>
  }
  const activeCampaign = campaigns.find(
    campaign => campaign.status === 'Active'
  )

  if (activeCampaign === null) return 'No active campaign found'

  return (
    <div
      className="enroll-gray-box pointer"
      onClick={() => {
        props.history.push('/campaigns')
      }}
    >
      <Query
        query={AccountTokenBalance}
        variables={{ account: walletAddress, token: 'OGN' }}
      >
        {({ loading, error, data }) => {
          let decimalDivision = web3.utils
            .toBN(10)
            .pow(web3.utils.toBN(18))

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

          return (
            <div>
              <div className="title mt-1">
                <fbt desc="profile.growthCampaignEarning">
                  Campaign Earnings
                </fbt>
              </div>
              <div className="mt-2">
                <img
                  className="ogn-icon pr-2"
                  src="images/ogn-icon.svg"
                />
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
              <div className="small-dark">
                {`Time left: ${formatTimeDifference(
                  Date.now(),
                  endDate
                )}`}
              </div>
              <div className="small-steel">
                <fbt desc="profile.growthPaidOut">
                  Paid out after campaign is finished
                </fbt>
              </div>
              <div className="small-steel">
                <fbt desc="profile.notSeeingEarnings">
                  Not seeing your earnings? Make sure you publish your
                  changes.
                </fbt>
              </div>
            </div>
          )
        }}
      </Query>
    </div>
  )
}

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
      let notEnrolled = true

      if (props.growthEnrollmentStatus) {
        notEnrolled = ['NotEnrolled', 'Banned'].includes(
          props.growthEnrollmentStatus
        )
      }

      return (
        <div className="growth-campaign-box">
          {notEnrolled && renderNotEnrolledBox(props.openmodalonstart)}
          {!notEnrolled && renderEnrolledBox(props, walletAddress)}
        </div>
      )
    }}
  </Query>
)

export default withRouter(withGrowthCampaign(GrowthCampaignBox))

require('react-styl')(`
  .growth-campaign-box
    .enroll-gray-box
      border: 1px solid var(--light)
      border-radius: var(--default-radius)
      padding: 1rem
      margin-bottom: 2rem
    .enroll-gray-box.pointer
      cursor: pointer
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
      background-color: white
    .ogn-icon
      position: relative
      top: -3px
    .ogn-amount
      color: var(--clear-blue)
    .title
      font-weight: normal
      color: var(--dark)
      font-size: 14px
    .small
      font-size: 10px
    .big
      font-size: 24px
    .small-dark
      font-size: 10px
      color: var(--dark)
      margin-top: 7px
      font-weight: normal
    .small-steel
      font-size: 10px
      margin-top: 7px
      color: var(--steel)
      font-weight: normal
`)
