import React, { Component, Fragment } from 'react'
import { withApollo, Query } from 'react-apollo'
import { fbt } from 'fbt-runtime'
import { get, find } from 'lodash'

import formatTimeDifference from 'utils/formatTimeDifference'
import QueryError from 'components/QueryError'
import profileQuery from 'queries/Profile'
import AccountTokenBalance from 'queries/TokenBalance'
import ActionGroupList from 'components/growth/ActionGroupList'
import GrowthInvite from 'pages/growth/Invite'
import Purchases from 'pages/growth/Purchases'
import Verifications from 'pages/growth/Verifications'
import MobileDownloadAction from 'components/growth/MobileDownloadAction'
import ProgressBar from 'components/ProgressBar'
import withGrowthCampaign from 'hoc/withGrowthCampaign'
import withIsMobile from 'hoc/withIsMobile'
import { calculatePendingAndAvailableActions } from 'utils/growthTools'
import LoadingSpinner from 'components/LoadingSpinner'

const GrowthEnum = require('Growth$FbtEnum')
const maxProgressBarTokens = 1000

const GrowthTranslation = ({ stringKey }) => {
  return (
    <fbt desc="growth">
      <fbt:enum enum-range={GrowthEnum} value={stringKey} />
    </fbt>
  )
}

function NavigationItem(props) {
  const { selected, onClick, title, isMobile } = props
  return (
    <a
      href="#"
      onClick={e => {
        e.preventDefault()
        onClick()
      }}
      className="pt-4 pr-4"
    >
      <div className="d-flex flex-column align-items-center">
        <div
          className={`title ${isMobile ? 'px-3' : ''} ${
            selected ? 'active' : ''
          }`}
        >
          {title}
        </div>
        {selected && <div className="select-bar" />}
      </div>
    </a>
  )
}

function CampaignNavList(props) {
  const { onNavigationClick, navigation, isMobile } = props
  const navigationLinks = () => (
    <div
      className={`campaign-list d-flex ${
        isMobile ? 'justify-content-center' : 'mt-4 justify-content-left'
      }`}
    >
      {/* TODO: Move this to a TabView component */}
      <NavigationItem
        selected={navigation === 'currentCampaign'}
        onClick={() => onNavigationClick('currentCampaign')}
        title={fbt('Current Campaign', 'growth.campaigns.currentCampaign')}
        isMobile={isMobile}
      />
      <NavigationItem
        selected={navigation === 'pastCampaigns'}
        onClick={() => onNavigationClick('pastCampaigns')}
        title={fbt('Past Campaigns', 'growth.campaigns.pastCampaigns')}
        isMobile={isMobile}
      />
    </div>
  )

  return (
    <Fragment>
      {isMobile && navigationLinks()}
      {!isMobile && (
        <div className="d-flex justify-content-between mt-4 pt-3">
          <img className="rewards-logo" src="images/origin-rewards-logo.svg" />
          {navigationLinks()}
        </div>
      )}
    </Fragment>
  )
}

function Campaign(props) {
  const { campaign, decimalDivision, isMobile } = props

  const {
    startDate,
    endDate,
    status,
    rewardEarned,
    actions,
    nameKey
  } = campaign

  let timeLabel = ''
  let subTitleText = ''

  if (status === 'Active') {
    timeLabel = `${fbt(
      'Time left',
      'RewardCampaigns.timeLeft'
    )}:${formatTimeDifference(Date.now(), endDate)}`
    subTitleText = fbt(
      'Earn Origin Tokens in many ways',
      'RewardCampaigns.earnOriginTokensInManyWays'
    )
  } else if (status === 'Pending') {
    timeLabel = `${fbt(
      'Starts in',
      'RewardCampaigns.startsIn'
    )}:${formatTimeDifference(Date.now(), startDate)}`
    subTitleText = fbt(
      `This campaign hasn't started yet`,
      'RewardCampaigns.hasntStartedYet'
    )
  } else if (status === 'Completed' || status === 'CapReached') {
    subTitleText = fbt(
      'This campaign has finished',
      'RewardCampaigns.campaignHasFinished'
    )
  }

  const mobileAction = find(
    actions,
    action => action.type === 'MobileAccountCreated'
  )

  // campaign rewards converted normalized to token value according to number of decimals
  const tokensEarned = web3.utils
    .toBN(rewardEarned ? rewardEarned.amount : 0)
    .div(decimalDivision)
  const tokenEarnProgress = Math.min(
    maxProgressBarTokens,
    tokensEarned.toString()
  )

  return (
    <Fragment>
      <div
        className={`d-flex ${
          isMobile ? 'justify-content-center' : 'justify-content-start'
        }`}
      >
        <h1 className={`mb-2 pt-4 ${isMobile ? 'mt-2' : 'mt-4'}`}>
          {GrowthEnum[nameKey] ? (
            <GrowthTranslation stringKey={nameKey} />
          ) : (
            fbt('Campaign', 'Campaign')
          )}
        </h1>
      </div>
      <div className="subtitle">{subTitleText}</div>
      <div className="d-flex justify-content-between campaign-info">
        <div>
          {status !== 'Pending' && (
            <Fragment>
              <span className="font-weight-bold">
                <fbt desc="Campaign.tokensEarned">Tokens earned</fbt>
              </span>
              <img className="ogn-icon pl-2 pr-1" src="images/ogn-icon.svg" />
              <span className="ogn-amount font-weight-bold">
                {tokensEarned.toString()}
              </span>
            </Fragment>
          )}
        </div>
        <div className="font-weight-bold">{timeLabel}</div>
      </div>
      <ProgressBar
        maxValue={maxProgressBarTokens}
        progress={tokenEarnProgress}
        showIndicators={false}
      />
      <MobileDownloadAction
        action={mobileAction}
        decimalDivision={decimalDivision}
        isMobile={isMobile}
      />
      <ActionGroupList
        campaign={campaign}
        actions={actions}
        decimalDivision={decimalDivision}
        isMobile={isMobile}
      />
    </Fragment>
  )
}

class PastCampaigns extends Component {
  render() {
    const { campaigns, decimalDivision, isMobile } = this.props

    const pastCampaigns = campaigns.filter(
      campaign =>
        campaign.status === 'Completed' || campaign.status === 'CapReached'
    )

    const totalEarnings = pastCampaigns
      .map(campaign =>
        web3.utils.toBN(
          campaign.rewardEarned ? campaign.rewardEarned.amount : 0
        )
      )
      .reduce(
        (accumulator, currentValue) => accumulator.add(currentValue),
        web3.utils.toBN(0)
      )
      .div(decimalDivision)

    return (
      <div className="past-campaigns d-flex flex-column">
        <div
          className={`d-flex flex-column ${
            isMobile ? 'align-items-center' : ''
          }`}
        >
          <div className="title">
            <fbt desc="growth.campaigns.totalEarnings">Total Earnings</fbt>
          </div>
          <div className="total-earned d-flex mt-2 align-items-center">
            <img className="mr-1" src="images/ogn-icon.svg" />
            <div>{totalEarnings.toString()}</div>
          </div>
        </div>
        <div>
          {pastCampaigns.map(campaign => {
            const nameKey = campaign.nameKey
            const tokensEarned = web3.utils
              .toBN(campaign.rewardEarned ? campaign.rewardEarned.amount : 0)
              .div(decimalDivision)

            return (
              <div key={nameKey} className="past-campaign">
                <div className="campaign-title">
                  {GrowthEnum[nameKey] ? (
                    <GrowthTranslation stringKey={nameKey} />
                  ) : (
                    'Campaign'
                  )}
                </div>
                <div
                  className={`d-flex align-items-center tokens-earned-holder ${
                    isMobile ? 'justify-content-between' : ''
                  }`}
                >
                  <div className="tokens-earned mr-2">
                    <fbt desc="growth.campaigns.totalEarned">Total earned</fbt>
                  </div>
                  <div
                    className={`total-earned d-flex align-items-center ${
                      isMobile ? 'mr-2' : ''
                    }`}
                  >
                    <img className="mr-1" src="images/ogn-icon.svg" />
                    <div>{tokensEarned.toString()}</div>
                  </div>
                </div>
                <ProgressBar
                  maxValue={maxProgressBarTokens}
                  progress={Math.min(
                    tokensEarned.toString(),
                    maxProgressBarTokens
                  )}
                  showIndicators={false}
                  style="compact"
                />
              </div>
            )
          })}
        </div>
      </div>
    )
  }
}

class GrowthCampaign extends Component {
  state = {
    navigation: 'currentCampaign'
  }

  render() {
    const { navigation } = this.state

    const { campaigns, accountId, decimalDivision, isMobile } = this.props

    const activeCampaign = campaigns.find(
      campaign => campaign.status === 'Active'
    )

    return (
      <Fragment>
        <CampaignNavList
          campaigns={campaigns}
          navigation={navigation}
          onNavigationClick={navigation => {
            this.setState({ navigation })
          }}
          isMobile={isMobile}
        />
        {navigation === 'currentCampaign' && (
          <Campaign
            campaign={activeCampaign}
            accountId={accountId}
            decimalDivision={decimalDivision}
            isMobile={isMobile}
          />
        )}
        {navigation === 'pastCampaigns' && (
          <PastCampaigns
            campaigns={campaigns}
            decimalDivision={decimalDivision}
            isMobile={isMobile}
          />
        )}
      </Fragment>
    )
  }
}

class GrowthCampaigns extends Component {
  state = {
    first: 5
  }

  componentDidUpdate() {
    if (
      this.props.growthEnrollmentStatus === 'NotEnrolled' ||
      this.props.growthEnrollmentStatus === 'Banned'
    ) {
      this.props.history.replace('/welcome')
    }
  }

  render() {
    const navigation = get(this.props, 'match.params.navigation') || 'Campaigns'
    const isMobile = this.props.isMobile

    return (
      <div className={`container growth-campaigns ${isMobile ? 'mobile' : ''}`}>
        <Query query={profileQuery} notifyOnNetworkStatusChange={true}>
          {({ error, data, networkStatus, loading }) => {
            if (networkStatus === 1 || loading) {
              return <LoadingSpinner/>
            } else if (error) {
              return <QueryError error={error} query={profileQuery} />
            }

            if (!data.web3.primaryAccount) {
              return ''
            }

            const accountId = data.web3.primaryAccount.id

            if (
              !this.props.growthCampaigns ||
              this.props.growthCampaignsLoading
            ) {
              return <LoadingSpinner/>
            }

            const campaigns = this.props.growthCampaigns
            if (campaigns.length == 0) {
              return (
                <h5 className="p-2">
                  <fbt desc="growth.campaigns.noCampaignsDetected">
                    No campaigns detected
                  </fbt>
                </h5>
              )
            }

            const activeCampaign = campaigns.find(
              campaign => campaign.status === 'Active'
            )

            const {
              completedPurchaseActions,
              notCompletedPurchaseActions,
              completedVerificationActions,
              notCompletedVerificationActions
            } = calculatePendingAndAvailableActions(activeCampaign)

            return (
              <Query
                query={AccountTokenBalance}
                variables={{ account: accountId, token: 'OGN' }}
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

                  return (
                    <Fragment>
                      {navigation === 'Campaigns' && (
                        <GrowthCampaign
                          campaigns={campaigns}
                          accountId={accountId}
                          decimalDivision={decimalDivision}
                          isMobile={isMobile}
                          completedVerificationActions={
                            completedVerificationActions
                          }
                          notCompletedVerificationActions={
                            notCompletedVerificationActions
                          }
                          completedPurchaseActions={completedPurchaseActions}
                          notCompletedPurchaseActions={
                            notCompletedPurchaseActions
                          }
                        />
                      )}
                      {navigation === 'invitations' && (
                        <GrowthInvite
                          activeCampaign={activeCampaign}
                          decimalDivision={decimalDivision}
                          isMobile={isMobile}
                        />
                      )}
                      {navigation === 'verifications' && (
                        <Verifications
                          decimalDivision={decimalDivision}
                          isMobile={isMobile}
                          completedVerificationActions={
                            completedVerificationActions
                          }
                          notCompletedVerificationActions={
                            notCompletedVerificationActions
                          }
                        />
                      )}
                      {navigation === 'purchases' && (
                        <Purchases
                          decimalDivision={decimalDivision}
                          isMobile={isMobile}
                          completedPurchaseActions={completedPurchaseActions}
                          notCompletedPurchaseActions={
                            notCompletedPurchaseActions
                          }
                        />
                      )}
                    </Fragment>
                  )
                }}
              </Query>
            )
          }}
        </Query>
      </div>
    )
  }
}

export default withIsMobile(withApollo(withGrowthCampaign(GrowthCampaigns)))

require('react-styl')(`
  .growth-campaigns.container
    max-width: 760px
  .growth-campaigns
    .rewards-logo
      width: 164px
      margin-bottom: -20px
    .info-icon
      padding-top: 30px
    .info-icon img
      width: 28px
    .ogn-amount
      color: var(--clear-blue)
    .ogn-icon
      position: relative
      top: -3px
    .campaign-info
      padding-top: 40px
    h1
      font-size: 40px
      font-weight: 500
    h5
      text-align: center
    .campaign-list
      .select-bar
        background-color: var(--clear-blue)
        height: 4px
        width: 100%
      .title
        font-size: 14px
        line-height: 1.93
        color: var(--bluey-grey)
        font-weight: normal
        white-space: nowrap
      .title.active
        color: var(--dark)
    .past-campaigns
      .title
        font-size: 21px
        font-weight: bold
        font-style: normal
        padding-top: 4.875rem
      .total-earned
        font-size: 38px
        font-weight: bold
        color: var(--clear-blue)
        line-height: 0.71
      .total-earned img
        width: 34px
        height: 34px
      .past-campaign
        margin-top: 45px
        .campaign-title
          font-family: Poppins
          font-size: 24px
          font-weight: 300
          color: var(--dark)
        .tokens-earned-holder
          margin-top: 12px
          .tokens-earned
            font-family: Lato
            color: var(--dark)
            font-weight: normal
        .total-earned
          font-size: 18px
          font-weight: bold
          color: var(--clear-blue)
          line-height: 1.5
        .total-earned img
          width: 20px
          height: 20px
  .growth-campaigns.mobile
    h1
      font-size: 24px
    .subtitle
      font-size: 16px
      text-align: center
    .campaign-info
      font-size: 16px
      padding-top: 1.875rem
      .ogn-icon
        width: 1.875rem
    .past-campaigns
      .title
        font-size: 25px
        padding-top: 2.9rem
      .total-earned
        font-size: 48px
      .total-earned img
        width: 3.125rem
        height: 3.125rem
      .past-campaign
        margin-top: 3.5rem
        .campaign-title
          font-size: 21px
          font-weight: 500
        .tokens-earned-holder
          margin-top: 0.6rem
          .tokens-earned
            font-size: 18px
        .total-earned
          font-size: 16px
          line-height: 1.3
        .total-earned img
          width: 1rem
          height: 1rem

`)
