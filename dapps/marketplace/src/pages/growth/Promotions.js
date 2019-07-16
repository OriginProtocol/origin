import React, { Fragment, useState } from 'react'
import { fbt } from 'fbt-runtime'
import Link from 'components/Link'
import { withRouter } from 'react-router-dom'
import withWallet from 'hoc/withWallet'

import ActionList from 'components/growth/ActionList'
import MobileModalHeader from 'components/MobileModalHeader'

import { Mutation } from 'react-apollo'
import VerifyPromotionMutation from 'mutations/VerifyPromotion'
import AutoMutate from 'components/AutoMutate'

function Promotions(props) {
  const [mutationProps, setMutationProps] = useState(false)

  const {
    decimalDivision,
    isMobile,
    completedPromotionActions,
    notCompletedPromotionActions
  } = props

  return (
    <Mutation mutation={VerifyPromotionMutation}
      onCompleted={() => setMutationProps(false)}
    >{verifyPromotion => (
      <Fragment>
        {mutationProps ? (
          <AutoMutate mutation={() => {
            verifyPromotion(mutationProps)
          }} />
        ) : null}
        {isMobile && (
          <MobileModalHeader
            showBackButton={true}
            className="px-0"
            onBack={() => {
              props.history.push('/campaigns')
            }}
          >
            <fbt desc="GrowthPromotions.promotions">Promotions</fbt>
          </MobileModalHeader>
        )}
        <div className={`growth-promotions ${isMobile ? 'mobile' : ''}`}>
          <div>
            {!isMobile && (
              <Fragment>
                <Link className="back d-flex mr-auto" to="/campaigns">
                  <img src="images/caret-blue.svg" />
                  <div>
                    <fbt desc="GrowthPromotions.backToCampaign">
                      Back to Campaign
                    </fbt>
                  </div>
                </Link>
                <h1 className={`mb-2 pt-md-3 mt-3`}>
                  <fbt desc="GrowthPromotions.promotions">
                    Promotions
                  </fbt>
                </h1>
              </Fragment>
            )}
            <div
              className={`promotions-subtitle ${
                isMobile ? 'text-center' : ''
              }`}
            >
              <fbt desc="GrowthPromotions.strenghtenToEarnTokens">
                Strengthen your profile and earn Origin Tokens by completing
                promotions.
              </fbt>
            </div>
          </div>

          <ActionList
            decimalDivision={decimalDivision}
            isMobile={isMobile}
            actions={notCompletedPromotionActions}
            onActionClick={action => {
              setMutationProps({
                variables: {
                  type: 'PROMOTE',
                  identity: props.wallet,
                  socialNetwork: 'TWITTER',
                  content: '@OriginProtocol'
                }
              })
            }}
          />
          {completedPromotionActions.length > 0 && (
            <ActionList
              title={fbt('Completed', 'growth.promotions.completed')}
              decimalDivision={decimalDivision}
              isMobile={isMobile}
              actions={completedPromotionActions}
            />
          )}
        </div>
      </Fragment>
    )}</Mutation>
  )
}

export default withWallet(withRouter(Promotions))

require('react-styl')(`
  .growth-promotions.mobile
    .promotions-subtitle
      font-size: 16px
  .growth-promotions
    .promotions-subtitle
      font-weight: 300
      line-height: 1.25
      color: var(--dark)
      font-size: 18px
    .back
      font-weight: bold
      color: var(--clear-blue)
      cursor: pointer
      font-size: 14px
      margin-top: 70px
    .back img
      width: 15px
      margin-right: 6px
      transform: rotate(270deg)
`)
