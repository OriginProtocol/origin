import React, { Fragment } from 'react'
import { fbt } from 'fbt-runtime'
import Link from 'components/Link'
import { withRouter } from 'react-router-dom'

import ActionList from 'components/growth/ActionList'
import MobileModalHeader from 'components/MobileModalHeader'

function Verifications(props) {
  const {
    decimalDivision,
    campaigns,
    isMobile
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

  //const actionCompleted = (action) => ['Exhausted', 'Completed'].includes(action.status)
  const actionCompleted = (action) => action.type === 'Facebook'

  const verificationActions = activeCampaign.actions.filter(action =>
    verificationRewardTypes.includes(action.type)
  )

  const completedActions = verificationActions.filter(action => actionCompleted(action))
  const notCompletedActions = verificationActions.filter(action => !actionCompleted(action))

  return (
    <Fragment>
      {isMobile && (
        <MobileModalHeader
          showBackButton={true}
          className="px-0"
          onBack={() => {
            props.history.push('/campaigns')
          }}
        >
          <fbt desc="GrowthVerifications.verifications">Verifications</fbt>
        </MobileModalHeader>
      )}
      <div
        className={`growth-verifications ${isMobile ? 'mobile' : ''}`}
      >
        <div>
          {!isMobile && (
            <Fragment>
              <Link className="back d-flex mr-auto" to="/campaigns">
                <img src="/images/caret-blue.svg" />
                <div>
                  <fbt desc="GrowthVerifications.backToCampaign">Back to Campaign</fbt>
                </div>
              </Link>
              <h1 className={`mb-2 pt-md-3 mt-3`}>
                <fbt desc="GrowthVerifications.verifications">Verifications</fbt>
              </h1>
            </Fragment>
          )}
          <div
            className={`verifications-subtitle ${isMobile ? 'text-center' : ''}`}
          >
            <fbt desc="GrowthVerifications.strenghtenToEarnTokens">
              Strengthen your profile and earn Origin Tokens by completing verifications.
            </fbt>
          </div>
        </div>

        <ActionList
          decimalDivision={decimalDivision}
          isMobile={isMobile}
          actions={notCompletedActions}
        />
        {completedActions.length > 0 && <ActionList
          title={fbt('Completed', 'growth.verifications.completed')}
          decimalDivision={decimalDivision}
          isMobile={isMobile}
          actions={completedActions}
        />}
      </div>
    </Fragment>
  )
}

export default withRouter(Verifications)

require('react-styl')(`
  .growth-verifications.mobile
    .verifications-subtitle
      font-size: 1rem
  .growth-verifications
    .verifications-subtitle
      font-weight: 300
      line-height: 1.25
      color: var(--dark)
      font-size: 1.125rem
    .back
      font-weight: bold
      color: var(--clear-blue)
      cursor: pointer
      font-size: 0.875rem
      margin-top: 70px
    .back img
      width: 15px
      margin-right: 6px
      transform: rotate(270deg)
`)
