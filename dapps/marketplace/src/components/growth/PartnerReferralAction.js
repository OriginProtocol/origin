import React, { Fragment } from 'react'
import { fbt } from 'fbt-runtime'
import withIsMobile from 'hoc/withIsMobile'
import withWallet from 'hoc/withWallet'
import { formatTokens } from 'utils/growthTools'

const GrowthEnum = require('Growth$FbtEnum')

function PartnerReferralAction(props) {
  if (!props.action) return null

  const {
    status,
    unlockConditions,
    conditionalName,
    reward,
    rewardEarned
  } = props.action

  const { isMobile } = props

  const title = conditionalName ? conditionalName : 'Partner Referral'
  const amount = reward.amount !== '0' ? reward.amount : rewardEarned.amount
  const actionCompleted = ['Exhausted', 'Completed'].includes(status)

  if (actionCompleted) {
    // Don't show if completed
    return null
  }

  const unlockConditionText = (
    <Fragment>
      <fbt desc="RewardActions.requires">Requires:</fbt>{' '}
      {unlockConditions
        .map(unlockCondition => {
          return GrowthEnum[unlockCondition.messageKey] ? (
            <fbt desc="growth">
              <fbt:enum
                enum-range={GrowthEnum}
                value={unlockCondition.messageKey}
              />
            </fbt>
          ) : (
            'Missing translation'
          )
        })
        .join(', ')}
    </Fragment>
  )

  const renderReward = amount => {
    return (
      <div className="reward d-flex pl-2 justify-content-start align-items-center flex-grow-1">
        <img className="act-group-ogn-icon mr-1" src="images/ogn-icon.svg" />
        <div className="value">
          {formatTokens(amount, props.decimalDivision)}
        </div>
      </div>
    )
  }

  const renderRewardHolder = (amount, text, className) => {
    return (
      <div
        className={`d-flex align-items-center ${
          isMobile ? 'm-2 flex-column' : 'm-3 flex-row'
        } ${className ? className : ''}`}
      >
        {isMobile && renderReward(amount)}
        <div className="sub-text ml-2">{text}</div>
        {!isMobile && renderReward(amount)}
      </div>
    )
  }

  return (
    <div
      className={`growth-action-group d-flex align-items-center ${
        isMobile ? 'mobile' : ''
      }`}
    >
      <div className="icon-holder">
        <img className="icon" src="images/growth/referral-icon-locked.svg" />
      </div>
      <div className="d-flex flex-column">
        <div className="title">{title}</div>
        <div className="requirement pr-2 d-flex align-items-center ">
          {unlockConditionText}
        </div>
      </div>
      {status === 'Inactive' &&
        renderRewardHolder(
          amount,
          fbt('Available', 'RewardActions.available'),
          'ml-auto'
        )}
    </div>
  )
}

export default withWallet(withIsMobile(PartnerReferralAction))

require('react-styl')(`
  .mobile-rewards-box
    cursor: pointer
    border-radius: 10px
    background-color: #f3f7f9
    margin-top: 30px
    padding: 20px
    position: relative
    .featured
      position: absolute
      right: 7px
      top: 7px
      color: white
      border-radius: 3px
      background-color: #fec100
      padding-left: 3px
      padding-right: 3px
      font-size: 11px
      font-weight: 900
    .phone-holder
      position: relative
    .green-tick
      position: absolute
      width: 20px
      bottom: -6px
      left: 30px
    .phones
      height: 90px
    .phones.small
      height: 63px
    h2
      font-family: Lato    
      font-size: 24px
      font-weight: bold
      line-height: 1.17
      color: #0d1d29
      margin-bottom: 2px
    .install
      font-size: 18px
      font-weight: normal
      line-height: 1.4rem
      color: var(--dark)
    .ogn-value
      font-size: 18px
      font-weight: bold
      color: #007fff
    .ogn-icon-small
      width: 20px
      margin-left: 5px
      margin-right: 3px
    .download-icon
      width: 135px
      height: 42px
    &.mobile
      .phones
        height: 117px
      .phones.small
        height: 55px
      .green-tick
        position: absolute
        width: 20px
        bottom: -6px
        left: 25px
      h2  
        font-size: 18px
      .install
        font-size: 14px
        line-height: 1rem
      .ogn-value
        font-size: 14px
      .ogn-icon-small
        width: 14px
        margin-left: 5px
        margin-right: 3px
        margin-bottom: 0px
      .download-icon
        width: 96px
        height: 30px
`)
