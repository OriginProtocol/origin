import React from 'react'
import { fbt } from 'fbt-runtime'
import Link from 'components/Link'

import ActionList from 'components/growth/ActionList'

function Verifications(props) {
  const {
    title,
    decimalDivision,
    campaigns,
    isMobile,
    handleNavigationChange
  } = props

  const activeCampaign = campaigns.find(
    campaign => campaign.status === 'Active'
  )
  const verificationRewardTypes = [
    'Email',
    'Profile',
    'Phone',
    'Twitter',
    'Airbnb',
    'Facebook',
    'Google',
    'Airbnb',
    'Facebook',
    'Google'
  ]
  const verificationActions = activeCampaign.actions.filter(action =>
    verificationRewardTypes.includes(action.type)
  )
  return (
    <div
      className={`container growth-verifications ${isMobile ? 'mobile' : ''}`}
    >
      <div>
        <Link className="back d-flex mr-auto" to="/campaigns">
          <img src="/images/caret-blue.svg" />
          <div>
            <fbt desc="RewardInvite.backToCampaign">Back to Campaign</fbt>
          </div>
        </Link>
        <h1 className={`mb-2 pt-md-3 mt-3`}>
          <fbt desc="GrowthPurhcases.purchases">Purchases</fbt>
        </h1>
        <fbt desc="GrowthPurhcases.completeToEarnTokens">
          Successfully complete certain purchases to earn Origin Tokens.
        </fbt>
      </div>

      <ActionList
        title={title}
        decimalDivision={decimalDivision}
        isMobile={isMobile}
        actions={verificationActions}
        handleNavigationChange={handleNavigationChange}
      />
    </div>
  )
}

export default Verifications

require('react-styl')(`
  .growth-verifications
    .back
      font-weight: bold
      color: var(--clear-blue)
      cursor: pointer
    .back img
      width: 15px
      margin-right: 6px
      transform: rotate(270deg)
`)
