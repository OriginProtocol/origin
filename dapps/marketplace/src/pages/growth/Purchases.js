import React, { Fragment } from 'react'
import { fbt } from 'fbt-runtime'
import Link from 'components/Link'
import { withRouter } from 'react-router-dom'

import ActionList from 'components/growth/ActionList'
import MobileModalHeader from 'components/MobileModalHeader'

function Purchases(props) {
  const {
    decimalDivision,
    isMobile,
    completedPurchaseActions,
    notCompletedPurchaseActions
  } = props

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
          <fbt desc="GrowthPurhcases.purchases">Purchases</fbt>
        </MobileModalHeader>
      )}
      <div className={`growth-purchases ${isMobile ? 'mobile' : ''}`}>
        <div>
          {!isMobile && (
            <Fragment>
              <Link className="back d-flex mr-auto" to="/campaigns">
                <img src="/images/caret-blue.svg" />
                <div>
                  <fbt desc="GrowthPurhcases.backToCampaign">
                    Back to Campaign
                  </fbt>
                </div>
              </Link>
              <h1 className={`mb-2 pt-md-3`}>
                <fbt desc="GrowthPurhcases.purchases">Purchases</fbt>
              </h1>
            </Fragment>
          )}
          <div
            className={`purchases-subtitle ${isMobile ? 'text-center' : ''}`}
          >
            <fbt desc="GrowthPurhcases.completeToEarnTokens">
              Successfully complete certain purchases to earn Origin Tokens.
            </fbt>
          </div>
        </div>

        <ActionList
          decimalDivision={decimalDivision}
          isMobile={isMobile}
          actions={notCompletedPurchaseActions}
        />
        {completedPurchaseActions.length > 0 && (
          <ActionList
            title={fbt('Completed', 'growth.purchases.completed')}
            decimalDivision={decimalDivision}
            isMobile={isMobile}
            actions={completedPurchaseActions}
          />
        )}
      </div>
    </Fragment>
  )
}

export default withRouter(Purchases)

require('react-styl')(`
  .growth-purchases.mobile
    .purchases-subtitle
      font-size: 1rem
  .growth-purchases
    .purchases-subtitle
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
