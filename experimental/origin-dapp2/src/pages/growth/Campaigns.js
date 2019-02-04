import React, { Component, Fragment } from 'react'
import { Query } from 'react-apollo'
import pick from 'lodash/pick'
import find from 'lodash/find'
import dayjs from 'dayjs'

import QueryError from 'components/QueryError'
import query from 'queries/AllGrowthCampaigns'

function CampaignNavItem(props) {
  const { campaign, selected, onClick } = props
  const completedIndicator = campaign.status === 'completed' || campaign.status === 'capReached'

  let statusClass = ''
  if (campaign.status === 'active')
    statusClass = 'active'
  else if (campaign.status === 'pending')
    statusClass = 'inactive'

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
          { completedIndicator && <img src="images/circular-check-button.svg"/>}
        </div>
        <div className={`name ${selected ? 'active' : ''}`}>{campaign.name}</div>
        {selected && <div className="select-bar"/>}
      </div>
    </a>
  )
}

function CampaignNavList(props) {
  const { campaigns, onCampaignClick, selectedCampaignId } = props
  return <div className="campaign-list d-flex justify-content-center mt-4">
    {
      campaigns.map(campaign => 
        <CampaignNavItem
          key={campaign.id}
          campaign={campaign}
          selected={campaign.id === selectedCampaignId}
          onClick={onCampaignClick}
        />
      )
    }
  </div>
}

function ProgressBar(props) {
  const { progress } = props

  return (<Fragment>
      <div
        className="campaign-progress mt-3"
        style={{ width: '100%' }}
      >
        <div className="background"/>
        <div
            className="foreground"
            style={{ width: `${progress}%` }}
          />
      </div>
      <div className="indicators d-flex justify-content-between mt-2">
        <div>0</div>
        <div>25</div>
        <div>50</div>
        <div>75</div>
        <div>100</div>
      </div>
    </Fragment>)
}

function Campaign(props) {
  const { campaign } = props
  const timeLeftDays = dayjs(campaign.endDate).diff(dayjs(), "day")
  const timeLeftHours = dayjs(campaign.endDate).diff(dayjs(), "hour") % 24
  const timeLeftMinutes = dayjs(campaign.endDate).diff(dayjs(), "minute") % 60

  let timeLeftLabel = ''
  if (timeLeftDays > 0)
    timeLeftLabel += ` ${timeLeftDays}d`
  if (timeLeftHours > 0)
    timeLeftLabel += ` ${timeLeftHours}h`
  if (timeLeftMinutes > 0)
    timeLeftLabel += ` ${timeLeftMinutes}m`

  const tokensEarned = campaign.rewardEarned.amount
  const tokenEarnProgress = Math.min(100, tokensEarned)
  return (
    <Fragment>
      <div className="d-flex justify-content-between">
        <h1 className="mb-2 pt-3">{campaign.name}</h1>
        <a>
          <img src="images/eth-icon.svg"/>
        </a>
      </div>
      <div>Get Origin Tokens by completing tasks below</div>
      <div className="d-flex justify-content-between campaign-info">
        <div>
          <span className="font-weight-bold">Tokens earned</span>
          <img className="ogn-icon pl-2 pr-1" src="images/ogn-icon.svg"/>
          <span className="ogn-amount font-weight-bold">{tokensEarned}</span>
        </div>
        <div className="font-weight-bold">
          Time left:{timeLeftLabel}
        </div>
      </div>
      <ProgressBar
        progress={tokenEarnProgress}
      />
    </Fragment>)
}

class GrowthCampaigns extends Component {
  state = {
    first: 5,
    selectedCampaignId: null
  }

  render() {
    const vars = pick(this.state, 'first')
    let selectedCampaignId = this.state.selectedCampaignId

    return (
      <div className="container campaigns">
      <Query
        query={query}
        variables={vars}
        notifyOnNetworkStatusChange={true}
      >
        {({ error, data, fetchMore, networkStatus, loading }) => {
          if (networkStatus === 1) {
            return <h5 className="p-2">Loading...</h5>
          } else if (error) {
            return <QueryError error={error} query={query} vars={vars} />
          }

          const campaigns = data.campaigns.nodes
          if (campaigns.length == 0) {
            return <h5 className="p-2">No campaigns detected</h5>
          }

          selectedCampaignId = selectedCampaignId !== null ? selectedCampaignId : campaigns[0].id
          const selectedCampaign = find(campaigns, campaign => campaign.id === selectedCampaignId)

          return (
            <Fragment>
              <CampaignNavList 
                campaigns={campaigns}
                onCampaignClick={(campaignId) => {
                  this.setState({ selectedCampaignId: campaignId })
                }}
                selectedCampaignId={selectedCampaignId}
              />
              <Campaign
                campaign={selectedCampaign}
              />
            </Fragment>
          )
        }}
      </Query>
      </div>
    )
  }
}

export default GrowthCampaigns

require('react-styl')(`
  .campaigns.container
    max-width: 760px;
  .campaigns
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
`)
