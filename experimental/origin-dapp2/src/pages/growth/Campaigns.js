import React, { Component, Fragment } from 'react'
import { withApollo, Query } from 'react-apollo'
import pick from 'lodash/pick'
import find from 'lodash/find'
import dayjs from 'dayjs'

import QueryError from 'components/QueryError'
import allCampaignsQuery from 'queries/AllGrowthCampaigns'
import profileQuery from 'queries/Profile'
import { Link } from 'react-router-dom'
import AccountTokenBalance from 'queries/TokenBalance'

function CampaignNavItem(props) {
  const { campaign, selected, onClick } = props
  const completedIndicator =
    campaign.status === 'completed' || campaign.status === 'capReached'

  let statusClass = ''
  if (campaign.status === 'active') {
    statusClass = 'active'
  } else if (campaign.status === 'pending') {
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
          {campaign.name}
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

function ProgressBar(props) {
  const { progress } = props

  return (
    <Fragment>
      <div className="campaign-progress mt-3" style={{ width: '100%' }}>
        <div className="background" />
        {progress > 0 && (
          <div className="foreground" style={{ width: `${progress}%` }} />
        )}
      </div>
      <div className="indicators d-flex justify-content-between mt-2">
        <div>0</div>
        <div>25</div>
        <div>50</div>
        <div>75</div>
        <div>100</div>
      </div>
    </Fragment>
  )
}

function Action(props) {
  let { type, status, reward } = props.action
  const showLockIcon = status === 'inactive'
  const actionCompleted = status === 'completed' || status === 'exhausted'
  let backgroundImgSrc = actionCompleted ? 'images/identity/verification-shape-green.svg' :
    'images/identity/verification-shape-blue.svg'

  let foregroundImgSrc
  let title
  let infoText

  if (type === 'email'){
    foregroundImgSrc = '/images/identity/email-icon-light.svg'
    title = 'Verify your Email'
    infoText = 'Confirm your email in attestations'
  } else if (type === 'profile'){
    foregroundImgSrc = '/images/identity/email-icon-light.svg'
    title = 'Update your name and picture'
    infoText = 'Edit your profile and update your name and picture'
  } else if (type === 'phoneNumber'){
    foregroundImgSrc = '/images/identity/phone-icon-light.svg'
    title = 'Verify your Phone Number'
    infoText = 'Confirm your phone number in attestations'
  } else if (type === 'twitter'){
    foregroundImgSrc = '/images/identity/twitter-icon-light.svg'
    title = 'Connect your Twitter Profile'
    infoText = 'Connect your Twitter Profile in attestationts'
  } else if (type === 'airbnb'){
    foregroundImgSrc = '/images/identity/airbnb-icon-light.svg'
    title = 'Connect your Airbnb Profile'
    infoText = 'Connect your Airbnb Profile in attestations'
  } else if (type === 'facebook'){
    foregroundImgSrc = '/images/identity/facebook-icon-light.svg'
    title = 'Connect your Facebook Profile'
    infoText = 'Connect your Facebook Profile in attestations'
  }

  return (
    <div className="d-flex action">
      <div className="col-2 d-flex justify-content-center">
        <div className="image-holder mt-auto mb-auto">
          <img className="background" src={backgroundImgSrc}/>
          <img className={type} src={foregroundImgSrc}/>
          {showLockIcon && 
            <img className="lock" src="images/growth/lock-icon.svg"/>
          }
        </div>
      </div>
      <div className="col-8 d-flex flex-column">
        <div className="title">{title}</div>
        <div className="info-text">{infoText}</div>
        {reward !== null && <div className="reward d-flex mr-auto align-items-center p-2 mt-2">
          <img
            className="mr-2"
            src="images/ogn-icon.svg"
          /> 
          +{reward.amount / Math.pow(10, 18)}
        </div>}
      </div>
      <div className="col-2 d-flex">
        {!actionCompleted &&
          <Link
            to="/profile"
            className="mt-auto mb-auto"
          >
            <button
              className="btn btn-primary btn-rounded mr-2"
              children="Go"
            />
          </Link>
        }
      </div>
    </div>
  )
}

function ActionList(props) {
  const { actions } = props.campaign

  return (
    <Fragment>
      <div className="d-flex flex-column">
        {actions.map(action => {
          return (<Action
            action={action}
            key={`${action.type}:${action.status}`}
          />)
        })}
      </div>
    </Fragment>
  )
}

function Campaign(props) {
  const { campaign, accountId } = props
  const timeLeftDays = dayjs(campaign.endDate).diff(dayjs(), 'day')
  const timeLeftHours = dayjs(campaign.endDate).diff(dayjs(), 'hour') % 24
  const timeLeftMinutes = dayjs(campaign.endDate).diff(dayjs(), 'minute') % 60

  let timeLeftLabel = ''
  if (timeLeftDays > 0) {
    timeLeftLabel += ` ${timeLeftDays}d`
  }
  if (timeLeftHours > 0) {
    timeLeftLabel += ` ${timeLeftHours}h`
  }
  if (timeLeftMinutes > 0) {
    timeLeftLabel += ` ${timeLeftMinutes}m`
  }

  return (
    <Query query={AccountTokenBalance} variables={{ account: accountId, token: 'OGN' }}>
      {({ loading, error, data }) => {
        const toBn = web3.utils.toBN
        let tokensEarned = toBn(0)
        let tokenEarnProgress = 0

        if (!loading && !error) {
          const tokenHolder = data.web3.account.token
          if (tokenHolder && tokenHolder.token){
            // campaign rewards converted normalized to token value according to number of decimals
            tokensEarned = toBn(campaign.rewardEarned ? campaign.rewardEarned.amount : 0)
              .div(toBn(10).pow(toBn(tokenHolder.token.decimals)))
            tokenEarnProgress = Math.min(100, tokensEarned.toString())
          }
        }

        return (
          <Fragment>
            <div className="d-flex justify-content-between">
              <h1 className="mb-2 pt-3">{campaign.name}</h1>
              <a>
                <img src="images/eth-icon.svg" />
              </a>
            </div>
            <div>Get Origin Tokens by completing tasks below</div>
            <div className="d-flex justify-content-between campaign-info">
              <div>
                <span className="font-weight-bold">Tokens earned</span>
                <img className="ogn-icon pl-2 pr-1" src="images/ogn-icon.svg" />
                <span className="ogn-amount font-weight-bold">{tokensEarned.toString()}</span>
              </div>
              <div className="font-weight-bold">Time left:{timeLeftLabel}</div>
            </div>
            <ProgressBar progress={tokenEarnProgress} />
            <ActionList campaign={campaign}/>
          </Fragment>
        )
      }}
    </Query>
  )
}

class GrowthCampaigns extends Component {
  state = {
    first: 5,
    selectedCampaignId: null
  }

  render() {
    let selectedCampaignId = this.state.selectedCampaignId

    return (
      <div className="container growth-campaigns">
        <Query
            query={profileQuery}
            notifyOnNetworkStatusChange={true}
          >
          {({ error, data, networkStatus, loading }) => {
            if (networkStatus === 1 || loading) {
              return <h5 className="p-2">Loading...</h5>
            } else if (error) {
              return <QueryError error={error} query={allCampaignsQuery} vars={vars} />
            }

            const vars = pick(this.state, 'first')
            const accountId = data.web3.metaMaskAccount.id
            vars.walletAddress = accountId
            return (
              <Query
                query={allCampaignsQuery}
                variables={vars}
                notifyOnNetworkStatusChange={true}
              >
                {({ error, data, networkStatus, loading }) => {
                  if (networkStatus === 1 || loading) {
                    return <h5 className="p-2">Loading...</h5>
                  } else if (error) {
                    return <QueryError error={error} query={allCampaignsQuery} vars={vars} />
                  }

                  const campaigns = data.campaigns.nodes
                  if (campaigns.length == 0) {
                    return <h5 className="p-2">No campaigns detected</h5>
                  }

                  selectedCampaignId =
                    selectedCampaignId !== null ? selectedCampaignId : campaigns[0].id
                  const selectedCampaign = find(
                    campaigns,
                    campaign => campaign.id === selectedCampaignId
                  )

                  return (
                    <Fragment>
                      <CampaignNavList
                        campaigns={campaigns}
                        onCampaignClick={campaignId => {
                          this.setState({ selectedCampaignId: campaignId })
                        }}
                        selectedCampaignId={selectedCampaignId}
                      />
                      <Campaign
                        campaign={selectedCampaign}
                        accountId={accountId}
                      />
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

export default withApollo(GrowthCampaigns)

require('react-styl')(`
  .growth-campaigns.container
    max-width: 760px;
  .growth-campaigns
    .indicators
      font-size: 10px;
      color: #455d75;
    .campaign-progress
      .background
        background-color: var(--pale-grey-two);
        border-radius: 5px;
        border: 1px solid #c2cbd3;
        height: 10px;
        position: absolute;
        z-index: 1;
        top: 0;
        left: 0;
        bottom: 0;
        right: 0;
      .foreground
        background-color: var(--clear-blue);
        border: 1px solid var(--greenblue);
        border-radius: 5px;
        height: 100%;
        z-index: 2;
        position: relative;
      height: 10px;
      position: relative;
    .ogn-amount
      color: var(--clear-blue);
    .ogn-icon
      position: relative;
      top: -3px;
    .campaign-info
      padding-top: 40px;
    h5
      text-align: center;
    .campaign-list
      .status
        width: 20px;
        height: 20px;
        border-radius: 50%;
      .status.inactive
          background-color: var(--light);
      .status.active
          background-color: var(--greenblue);
      .campaign
        .name
          font-size: 0.88rem;
          line-height: 1.93;
          color: var(--bluey-grey);
          font-weight: normal;
        .name.active
          color: var(--dark);
        .select-bar
          background-color: var(--clear-blue);
          height: 4px;
          width: 100%;
      img
        width: 20px;
        height: 20px;
        vertical-align: inherit;
    .action
      height: 140px;
      border: 1px solid var(--light);
      border-radius: 5px;
      margin-top: 20px;
      padding: 20px;
    .action .background
      width: 72px;
    .action .profile
      position: absolute;
      left: 20px;
      top: 27px;
      width: 30px;
    .action .email
      position: absolute;
      left: 20px;
      top: 27px;
      width: 30px;
    .action .phoneNumber
      position: absolute;
      left: 25px;
      top: 20px;
      width: 22px;
    .action .facebook
      position: absolute;
      left: 24px;
      top: 18px;
      width: 21px;
    .action .airbnb
      position: absolute;
      left: 15px;
      top: 19px;
      width: 44px;
    .action .twitter
      position: absolute;
      left: 17px;
      top: 22px;
      width: 39px;
    .action .lock
      position: absolute;
      right: -12px;
      bottom: 0px;
      width: 30px;
    .action .image-holder
      position: relative;
    .action .title
      font-size: 18px;
      font-weight: bold;
    .action .info-text
      font-size: 18px;
      font-weight: 300;
    .action .reward
      height: 28px;
      background-color: var(--pale-grey);
      border-radius: 52px;
      font-size: 14px;
      font-weight: bold;
      color: var(--clear-blue);
    .action img
      width: 19px;

`)
