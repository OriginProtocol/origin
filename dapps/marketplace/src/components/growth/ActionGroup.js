import React, { Fragment } from 'react'
import { fbt } from 'fbt-runtime'
import { formatTokens } from 'utils/growthTools'
import Link from 'components/Link'

const GrowthEnum = require('Growth$FbtEnum')

function ActionGroup(props) {
  const { isMobile, type, completedActions, notCompletedActions } = props

  let iconSource,
    title,
    locked = false,
    unlockConditionText

  const allActionsInactive = ![
    ...completedActions,
    ...notCompletedActions
  ].some(action => action.status !== 'Inactive')

  if (type === 'verifications') {
    iconSource = 'images/growth/verifications-icon.svg'
    title = fbt('Verifications', 'growth.actionGroup.verifications')
  } else if (type === 'purchases') {
    iconSource = 'images/growth/purchases-icon.svg'
    title = fbt('Purchases', 'growth.actionGroup.purchases')
  } else if (type === 'promotions') {
    locked = allActionsInactive
    title = fbt('Promote Origin', 'growth.actionGroup.promotions')
    iconSource = locked
      ? 'images/growth/social-media-icon-locked.svg'
      : 'images/growth/social-media-icon.svg'

    if (locked) {
      unlockConditionText = (
        <fbt desc="Rewards.promotionsLock">Requires: Twitter attestation</fbt>
      )
    }
  } else if (type === 'follows') {
    locked = allActionsInactive
    title = fbt('Follow Origin', 'growth.actionGroup.follow')
    iconSource = locked
      ? 'images/growth/social-media-follow-icon-locked.svg'
      : 'images/growth/social-media-follow-icon.svg'
    if (locked) {
      unlockConditionText = (
        <fbt desc="Rewards.followsLock">Requires: Twitter attestation</fbt>
      )
    }
  } else if (type === 'invitations') {
    const invitationAction = completedActions[0]
    locked = invitationAction.status === 'Inactive'

    if (locked) {
      unlockConditionText = (
        <Fragment>
          <fbt desc="RewardActions.requires">Requires:</fbt>{' '}
          {invitationAction.unlockConditions
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
    }

    iconSource = locked
      ? 'images/growth/invitations-icon-disabled.svg'
      : 'images/growth/invitations-icon.svg'
    title = fbt('Invitations', 'growth.actionGroup.invitations')
  }

  const sumActionRewards = (actions, type, mode = 'earned') => {
    if (!['earned', 'available'].includes(mode))
      throw new Error(`Unrecognised mode sum action mode: ${mode}`)

    let aggregate = web3.utils.toBN('0')
    actions.forEach(action => {
      if (type === 'invitations') {
        if (mode === 'earned') {
          if (action.rewardEarned)
            aggregate = web3.utils
              .toBN(action.rewardEarned.amount)
              .add(aggregate)
        } else {
          if (action.reward) {
            aggregate = web3.utils
              .toBN(action.reward.amount)
              .mul(web3.utils.toBN(25))
              .add(aggregate)
          }
        }
      } else {
        const rewardField = mode === 'earned' ? 'rewardEarned' : 'reward'
        if (action[rewardField])
          aggregate = web3.utils.toBN(action[rewardField].amount).add(aggregate)
      }
    })
    return aggregate
  }

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
    <Link
      className={`growth-action-group d-flex align-items-center ${
        isMobile ? 'mobile' : ''
      }`}
      to={locked ? '' : `campaigns/${type}`}
    >
      <div className="icon-holder">
        <img className="icon" src={iconSource} />
        {locked && (
          <img className="lock-icon" src="images/growth/lock-icon.svg" />
        )}
      </div>
      <div className="d-flex flex-column">
        <div className="title">{title}</div>
        {locked && unlockConditionText && (
          <div className="requirement pr-2 d-flex align-items-center ">
            {unlockConditionText}
          </div>
        )}
      </div>
      {!locked &&
        renderRewardHolder(
          sumActionRewards(
            type === 'invitations'
              ? [...completedActions, ...notCompletedActions]
              : notCompletedActions,
            type,
            'available'
          ),
          fbt('Available', 'RewardActions.available'),
          'ml-auto'
        )}
      {!locked &&
        renderRewardHolder(
          sumActionRewards(
            type === 'invitations'
              ? [...completedActions, ...notCompletedActions]
              : completedActions,
            type,
            'earned'
          ),
          fbt('Earned', 'RewardActions.earned'),
          'ml-3'
        )}
    </Link>
  )
}

export default ActionGroup

require('react-styl')(`
  .growth-action-group.mobile
    padding-top: 20px
    padding-bottom: 20px
    .lock-icon
      width: 16px
    .icon
      width: 40px
    .title
      font-size: 18px
      margin-left: 11px
    .requirement
      margin-left: 11px
    .act-group-ogn-icon
      width: 14px
    .value
      font-size: 0.875rem
    .sub-text
      margin-top: -5px
      font-size: 11px
  .growth-action-group
    padding-top: 30px
    padding-bottom: 30px
    cursor: pointer
    &:not(:last-child)
      border-bottom: 1px solid #c0cbd4
    .requirement
      font-size: 14px
      color: #455d75
      margin-left: 25px
    .icon-holder
      position: relative
    .lock-icon
      position: absolute
      width: 24px
      right: -2px
      bottom: 0px  
    .icon
      width: 60px
    .title
      font-size: 24px
      font-family: Lato
      font-weight: bold
      color: black
      margin-left: 25px
      cursor: pointer
    .act-group-ogn-icon
      width: 20px
    .value
      font-size: 18px
      font-weight: bold
      color: var(--clear-blue)
    .sub-text
      font-size: 16px
      font-weight: normal
      line-height: 2.45
      text-align: center
      color: #455d75
`)
