import React, { Component, Fragment } from 'react'
import { withApollo, Query } from 'react-apollo'
import pick from 'lodash/pick'
import find from 'lodash/find'
import { fbt } from 'fbt-runtime'

import formatTimeDifference from 'utils/formatTimeDifference'
import QueryError from 'components/QueryError'
import allCampaignsQuery from 'queries/AllGrowthCampaigns'
import profileQuery from 'queries/Profile'
import enrollmentStatusQuery from 'queries/EnrollmentStatus'
import AccountTokenBalance from 'queries/TokenBalance'
import Action from 'pages/growth/Action'
import GrowthInvite from 'pages/growth/Invite'
import ProgressBar from 'components/ProgressBar'

const GrowthEnum = require('Growth$FbtEnum')
const maxProgressBarTokens = 1000

const GrowthTranslation = ({ stringKey }) => {
  return (
    <fbt desc="growth">
      <fbt:enum enum-range={GrowthEnum} value={stringKey} />
    </fbt>
  )
}

function CampaignNavItem(props) {
  const { campaign, selected, onClick } = props
  const completedIndicator =
    campaign.status === 'Completed' || campaign.status === 'CapReached'

  let statusClass = ''
  if (campaign.status === 'Active') {
    statusClass = 'active'
  } else if (campaign.status === 'Pending') {
    statusClass = 'inactive'
  }

  return (
    <a
      href="#"
      onClick={e => {
        e.preventDefault()
        onClick(campaign.id)
      }}
      className="pt-4 pb-4 pl-3 pr-3"
    >
      <div className="campaign d-flex flex-column align-items-center">
        <div className={`status ${statusClass}`}>
          {completedIndicator && <img src="images/circular-check-button.svg" />}
        </div>
        <div className={`name ${selected ? 'active' : ''}`}>
          {GrowthEnum[campaign.shortNameKey] ? (
            <GrowthTranslation stringKey={campaign.shortNameKey} />
          ) : (
            'Campaign'
          )}
        </div>
        {selected && <div className="select-bar" />}
      </div>
    </a>
  )
}

function CampaignNavList(props) {
  const { campaigns, onCampaignClick, selectedCampaignId } = props
  return (
    <div className="campaign-list d-flex justify-content-center mt-4">
      {campaigns.map(campaign => (
        <CampaignNavItem
          key={campaign.id}
          campaign={campaign}
          selected={campaign.id === selectedCampaignId}
          onClick={onCampaignClick}
        />
      ))}
    </div>
  )
}

function ActionList(props) {
  return (
    <Fragment>
      <div className="d-flex flex-column">
        {props.title !== undefined && (
          <div className="action-title">{props.title}</div>
        )}
        {props.actions.map(action => {
          return (
            <Action
              action={action}
              decimalDivision={props.decimalDivision}
              key={`${action.type}:${action.status}`}
              handleNavigationChange={props.handleNavigationChange}
              setReferralAction={props.setReferralAction}
            />
          )
        })}
      </div>
    </Fragment>
  )
}

function Campaign(props) {
  const {
    campaign,
    handleNavigationChange,
    setReferralAction,
    decimalDivision
  } = props

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
    timeLabel = `Time left:${formatTimeDifference(Date.now(), endDate)}`
    subTitleText = 'Get Origin Tokens by completing tasks below'
  } else if (status === 'Pending') {
    timeLabel = `Starts in:${formatTimeDifference(Date.now(), startDate)}`
    subTitleText = `This campaign hasn't started yet`
  } else if (status === 'Completed' || status === 'CapReached') {
    subTitleText = 'This campaign has finished'
  }

  // campaign rewards converted normalized to token value according to number of decimals
  const tokensEarned = web3.utils
    .toBN(rewardEarned ? rewardEarned.amount : 0)
    .div(decimalDivision)
  const tokenEarnProgress = Math.min(
    maxProgressBarTokens,
    tokensEarned.toString()
  )

  const actionCompleted = action => {
    return ['Exhausted', 'Completed'].includes(action.status)
  }

  const completedActions = actions.filter(action => actionCompleted(action))
  const nonCompletedActions = actions.filter(action => !actionCompleted(action))

  return (
    <Fragment>
      <div className="d-flex justify-content-between">
        <h1 className="mb-2 pt-3">
          {GrowthEnum[nameKey] ? (
            <GrowthTranslation stringKey={nameKey} />
          ) : (
            'Campaign'
          )}
        </h1>
        <a className="info-icon">
          <img src="images/growth/info-icon-inactive.svg" />
        </a>
      </div>
      <div>{subTitleText}</div>
      <div className="d-flex justify-content-between campaign-info">
        <div>
          {status !== 'Pending' && (
            <Fragment>
              <span className="font-weight-bold">Tokens earned</span>
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
        showIndicators={true}
      />
      {status === 'Active' && nonCompletedActions.length > 0 && (
        <ActionList
          actions={nonCompletedActions}
          decimalDivision={decimalDivision}
          handleNavigationChange={handleNavigationChange}
          setReferralAction={setReferralAction}
        />
      )}
      {status !== 'Pending' && completedActions.length > 0 && (
        <ActionList
          title="Completed"
          actions={completedActions}
          decimalDivision={decimalDivision}
        />
      )}
    </Fragment>
  )
}

class GrowthCampaigns extends Component {
  state = {
    first: 5,
    selectedCampaignId: null,
    navigation: 'Campaigns',
    referralAction: null
  }

  handleNavigationChange(navigation) {
    this.setState({ navigation })
  }

  setReferralAction(referralAction) {
    this.setState({ referralAction })
  }

  render() {
    let selectedCampaignId = this.state.selectedCampaignId
    const { navigation, referralAction } = this.state

    return (
      <div className="container growth-campaigns">
        <Query query={profileQuery} notifyOnNetworkStatusChange={true}>
          {({ error, data, networkStatus, loading }) => {
            if (networkStatus === 1 || loading) {
              return <h5 className="p-2">Loading...</h5>
            } else if (error) {
              return <QueryError error={error} query={profileQuery} />
            }

            const accountId = data.web3.primaryAccount.id
            return (
              <Query
                query={enrollmentStatusQuery}
                variables={{ walletAddress: accountId }}
                notifyOnNetworkStatusChange={true}
                // enrollment info can change, do not cache it
                fetchPolicy="network-only"
                onCompleted={({ enrollmentStatus }) => {
                  // if user is not enrolled redirect him to welcome page
                  if (enrollmentStatus !== 'Enrolled') {
                    this.props.history.push('/welcome')
                  }
                }}
              >
                {({ error, networkStatus, loading }) => {
                  if (networkStatus === 1 || loading) {
                    return <h5 className="p-2">Loading...</h5>
                  } else if (error) {
                    return (
                      <QueryError error={error} query={enrollmentStatusQuery} />
                    )
                  }

                  const vars = pick(this.state, 'first')

                  return (
                    <Query
                      query={allCampaignsQuery}
                      variables={vars}
                      notifyOnNetworkStatusChange={true}
                      // do not cache, so user does not need to refresh page when an
                      // action is completed
                      fetchPolicy="network-only"
                    >
                      {({ error, data, networkStatus, loading }) => {
                        if (networkStatus === 1 || loading) {
                          return <h5 className="p-2">Loading...</h5>
                        } else if (error) {
                          return (
                            <QueryError
                              error={error}
                              query={allCampaignsQuery}
                              vars={vars}
                            />
                          )
                        }

                        const campaigns = data.campaigns.nodes
                        if (campaigns.length == 0) {
                          return <h5 className="p-2">No campaigns detected</h5>
                        }

                        if (selectedCampaignId === null) {
                          const activeCampaign = campaigns.find(
                            campaign => campaign.status === 'Active'
                          )

                          if (activeCampaign !== undefined) {
                            selectedCampaignId = activeCampaign.id
                          } else {
                            selectedCampaignId = campaigns[0].id
                          }
                        }

                        const selectedCampaign = find(
                          campaigns,
                          campaign => campaign.id === selectedCampaignId
                        )

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
                                    .pow(
                                      web3.utils.toBN(
                                        tokenHolder.token.decimals
                                      )
                                    )
                                }
                              }

                              return (
                                <Fragment>
                                  {navigation === 'Campaigns' && (
                                    <Fragment>
                                      <CampaignNavList
                                        campaigns={campaigns}
                                        onCampaignClick={campaignId => {
                                          this.setState({
                                            selectedCampaignId: campaignId
                                          })
                                        }}
                                        selectedCampaignId={selectedCampaignId}
                                      />
                                      <Campaign
                                        campaign={selectedCampaign}
                                        accountId={accountId}
                                        handleNavigationChange={navigation =>
                                          this.handleNavigationChange(
                                            navigation
                                          )
                                        }
                                        setReferralAction={action =>
                                          this.setReferralAction(action)
                                        }
                                        decimalDivision={decimalDivision}
                                      />
                                    </Fragment>
                                  )}
                                  {navigation === 'Invite' && (
                                    <GrowthInvite
                                      handleNavigationChange={navigation =>
                                        this.handleNavigationChange(navigation)
                                      }
                                      referralAction={referralAction}
                                      decimalDivision={decimalDivision}
                                    />
                                  )}
                                </Fragment>
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
          }}
        </Query>
      </div>
    )
  }
}

export default withApollo(GrowthCampaigns)

require('react-styl')(`
  .growth-campaigns.container
    max-width: 760px
  .growth-campaigns
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
    h5
      text-align: center
    .action-title
      font-weight: bold
      color: var(--steel)
      margin-top: 30px
      margin-left: 5px
      margin-bottom: -5px
    .campaign-list
      .status
        width: 20px
        height: 20px
        border-radius: 50%
      .status.inactive
          background-color: var(--light)
      .status.active
          background-color: var(--greenblue)
      .campaign
        .name
          font-size: 0.88rem
          line-height: 1.93
          color: var(--bluey-grey)
          font-weight: normal
        .name.active
          color: var(--dark)
        .select-bar
          background-color: var(--clear-blue)
          height: 4px
          width: 100%
      img
        width: 20px
        height: 20px
        vertical-align: inherit
`)
