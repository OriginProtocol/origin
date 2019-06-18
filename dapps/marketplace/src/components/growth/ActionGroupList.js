import React from 'react'
import find from 'lodash/find'

import ActionGroup from 'components/growth/ActionGroup'
import { calculatePendingAndAvailableActions } from 'utils/growthTools'

function ActionGroupList(props) {
  const { campaign, isMobile } = props

  const {
    completedPurchaseActions,
    notCompletedPurchaseActions,
    completedVerificationActions,
    notCompletedVerificationActions
  } = calculatePendingAndAvailableActions(campaign)
  const referralAction = find(
    campaign.actions,
    action => action.type === 'Referral'
  )

  return (
    <div
      className={`action-list-group d-flex flex-column ${
        isMobile ? 'mobile' : ''
      }`}
    >
      <ActionGroup
        type="verifications"
        completedActions={completedVerificationActions}
        notCompletedActions={notCompletedVerificationActions}
        hasBorder={true}
        {...props}
      />
      <ActionGroup
        type="purchases"
        completedActions={completedPurchaseActions}
        notCompletedActions={notCompletedPurchaseActions}
        hasBorder={true}
        {...props}
      />
      <ActionGroup
        type="invitations"
        completedActions={[referralAction]}
        notCompletedActions={[]}
        {...props}
      />
    </div>
  )
}

export default ActionGroupList
