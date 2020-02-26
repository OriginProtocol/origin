import React from 'react'
import get from 'lodash/get'
import { fbt } from 'fbt-runtime'
import numberFormat from 'utils/numberFormat'

const actionTypeToName = {
  MobileAccountCreated: () => {
    const mobileAccountCreatedText = (
      <fbt desc="CompletedActionGroups.MobileAccountCreated">
        Origin Marketplace installed
      </fbt>
    )
    return mobileAccountCreatedText
  },
  PartnerReferral: action => {
    const partnerReferralText = (
      <fbt desc="CompletedActionGroups.PartnerReferral">Partner Referral</fbt>
    )
    if (action.conditionalName) {
      return action.conditionalName
    }
    return partnerReferralText
  },
  BrowserExtensionInstall: action => {
    const browserExtensionInstallText = (
      <fbt desc="CompletedActionGroups.BrowserExtensionInstall">
        Origin Browser Extension Installed
      </fbt>
    )
    if (action.conditionalName) {
      return action.conditionalName
    }
    return browserExtensionInstallText
  }
}

const CompletedActionGroupItem = ({ action, ...props }) => {
  if (!action || !action.reward) {
    return null
  }

  let amount = action.reward.amount
  if (amount === '0' && action.rewardEarned.amount !== '0') {
    amount = action.rewardEarned.amount
  }

  return (
    <div className="completed-action-group-item">
      <div className="action-name">
        {actionTypeToName[action.type](action) || ''}
      </div>
      <div className="action-reward">
        {numberFormat(
          web3.utils
            .toBN(amount)
            .div(props.decimalDivision)
            .toString(),
          2,
          '.',
          ',',
          true
        )}
      </div>
    </div>
  )
}

const CompletedActionGroups = props => {
  const completedActions = get(props, 'actions', []).filter(action => {
    return action && action.status === 'Completed'
  })

  if (completedActions.length === 0) {
    return null
  }

  return (
    <div className="completed-action-groups">
      <div className="completed-action-group-item title">
        <fbt desc="CompletedActionGroups.title">Completed</fbt>
      </div>
      {completedActions.map(action => (
        <CompletedActionGroupItem
          key={action.type}
          action={action}
          {...props}
        />
      ))}
    </div>
  )
}

export default CompletedActionGroups

require('react-styl')(`
  .completed-action-groups
    margin: 1rem 0 3rem 0
    display: flex
    flex-direction: column
    .completed-action-group-item
      padding: 1rem 0
      border-bottom: 1px solid #c0cbd4
      display: flex
      flex-direction: row
      justify-content: center
      align-items: center
      &.title
        font-size: 0.875rem
        color: #455d75
        padding: 0.5rem 0
        flex-direction: column
        text-align: left
      &:last-child
        border-bottom: 0
      .action-name
        font-weight: bold
        font-size: 1rem
        flex: 1
      .action-reward
        font-weight: bold
        color: #c0cbd4
        font-size: 0.875rem
        display: flex
        flex-direction: row
        justify-content: center
        align-items: center
        &:before
          content: ''
          width: 1rem
          height: 1rem
          display: inline-block
          background-image: url('/images/ogn-icon-grayed-out.svg')
          background-repeat: no-repeat
          background-size: 1rem
          background-position: center
          margin-right: 0.5rem
`)
