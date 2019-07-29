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

import ToastNotification from 'pages/user/ToastNotification'
import { formatTokens } from 'utils/growthTools'

const getToastMessage = (action, decimalDivision) => {
  const tokensEarned = formatTokens(action.reward.amount, decimalDivision)
  return fbt(
    `You earned ` + fbt.param('amount', tokensEarned) + ' OGN',
    'GrowthFollowOrigin.tokensEarned'
  )
}

const actionTypeToNetwork = actionType => {
  switch (actionType) {
    case 'TwitterFollow':
      return 'TWITTER'
  }

  return null
}

let handleShowNotification

function FollowOrigin(props) {
  const [currentAction, setCurrentAction] = useState(null)

  const {
    decimalDivision,
    isMobile,
    completedFollowActions,
    notCompletedFollowActions,
    growthCampaignsRefetch
  } = props

  return (
    <>
      <ToastNotification
        setShowHandler={handler => (handleShowNotification = handler)}
      />
      <Mutation
        mutation={VerifyPromotionMutation}
        onCompleted={({ verifyPromotion }) => {
          if (verifyPromotion.success) {
            const message = getToastMessage(currentAction, decimalDivision)
            handleShowNotification(message, 'green')
            if (growthCampaignsRefetch) {
              growthCampaignsRefetch()
            }
          }
          setCurrentAction(null)
        }}
        onError={errorData => {
          console.error(`Failed to verify follower`, errorData)
          setCurrentAction(null)
        }}
      >
        {verifyPromotion => (
          <Fragment>
            {currentAction ? (
              <AutoMutate
                mutation={() => {
                  verifyPromotion({
                    variables: {
                      type: 'FOLLOW',
                      identity: props.wallet,
                      identityProxy: props.walletProxy,
                      socialNetwork: actionTypeToNetwork(currentAction.type)
                    }
                  })
                }}
              />
            ) : null}
            {isMobile && (
              <MobileModalHeader
                showBackButton={true}
                className="px-0"
                onBack={() => {
                  props.history.push('/campaigns')
                }}
              >
                <fbt desc="GrowthFollowOrigin.followOrigin">Follow Origin</fbt>
              </MobileModalHeader>
            )}
            <div className={`growth-follow-origin ${isMobile ? 'mobile' : ''}`}>
              <div>
                {!isMobile && (
                  <Fragment>
                    <Link className="back d-flex mr-auto" to="/campaigns">
                      <img src="images/caret-blue.svg" />
                      <div>
                        <fbt desc="GrowthFollowOrigin.backToCampaign">
                          Back to Campaign
                        </fbt>
                      </div>
                    </Link>
                    <h1 className={`mb-2 pt-md-3 mt-3`}>
                      <fbt desc="GrowthFollowOrigin.followOrigin">
                        FollowOrigin
                      </fbt>
                    </h1>
                  </Fragment>
                )}
                <div
                  className={`follow-origin-subtitle ${
                    isMobile ? 'text-center' : ''
                  }`}
                >
                  <fbt desc="GrowthFollowOrigin.earnByFollowing">
                    Earn Origin Tokens (OGN) by following us on social media and
                    sharing Origin content.
                  </fbt>
                </div>
              </div>

              <ActionList
                decimalDivision={decimalDivision}
                isMobile={isMobile}
                actions={notCompletedFollowActions}
                onActionClick={action => {
                  setCurrentAction(action)
                }}
              />
              {completedFollowActions.length > 0 && (
                <ActionList
                  title={fbt('Completed', 'growth.followOrigin.completed')}
                  decimalDivision={decimalDivision}
                  isMobile={isMobile}
                  actions={completedFollowActions}
                />
              )}
            </div>
          </Fragment>
        )}
      </Mutation>
    </>
  )
}

export default withWallet(withRouter(FollowOrigin))

require('react-styl')(`
  .growth-follow-origin.mobile
    .follow-origin-subtitle
      font-size: 16px
  .growth-follow-origin
    .follow-origin-subtitle
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
