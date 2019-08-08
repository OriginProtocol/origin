import React, { Fragment, useState } from 'react'
import { fbt } from 'fbt-runtime'
import Link from 'components/Link'
import { withRouter } from 'react-router-dom'
import withWallet from 'hoc/withWallet'

import ActionList from 'components/growth/ActionList'
import MobileModalHeader from 'components/MobileModalHeader'

import { Mutation } from 'react-apollo'
import VerifyPromotionMutation from 'mutations/VerifyPromotion'
import ConfirmFollowMutation from 'mutations/ConfirmSocialFollow'
import AutoMutate from 'components/AutoMutate'

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
    case 'FacebookLike':
      return 'FACEBOOK'
  }

  return null
}

const VerifyOrConfirmFollow = ({
  showNotification,
  currentAction,
  setCurrentAction,
  actionConfirmed,
  setActionConfirmed,
  decimalDivision,
  growthCampaignsRefetch,
  wallet,
  walletProxy
}) => {
  if (!currentAction) return null

  const socialNetwork = actionTypeToNetwork(currentAction.type)

  return (
    <>
      {socialNetwork === 'TWITTER' && (
        <Mutation
          mutation={VerifyPromotionMutation}
          onCompleted={({ verifyPromotion }) => {
            if (verifyPromotion.success) {
              if (showNotification) {
                const message = getToastMessage(currentAction, decimalDivision)
                showNotification(message, 'green')
              }
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
            <>
              <AutoMutate
                mutation={() => {
                  verifyPromotion({
                    variables: {
                      type: 'FOLLOW',
                      identity: wallet,
                      identityProxy: walletProxy,
                      socialNetwork: socialNetwork
                    }
                  })
                }}
              />
            </>
          )}
        </Mutation>
      )}
      {!actionConfirmed && socialNetwork === 'FACEBOOK' && (
        <Mutation
          mutation={ConfirmFollowMutation}
          onCompleted={({ confirmSocialFollow }) => {
            // if successful
            if (confirmSocialFollow) {
              setActionConfirmed(true)
              
              if (showNotification) {
                const message = getToastMessage(currentAction, decimalDivision)
                showNotification(message, 'green')
              }

              if (growthCampaignsRefetch) {
                growthCampaignsRefetch()
              }
            } else {
              console.error(
                `Can not confirm action with type ${currentAction.type}`
              )
            }
          }}
          onError={errorData => {
            console.error(
              `Can not confirm action with type ${currentAction.type}`,
              errorData
            )
          }}
        >
          {confirmSocialFollow => (
            <AutoMutate
              mutation={() => {
                confirmSocialFollow({
                  variables: {
                    actionType: currentAction.type
                  }
                })
              }}
            />
          )}
        </Mutation>
      )}
    </>
  )
}
function FollowOrigin(props) {
  const [currentAction, setCurrentAction] = useState(null)
  const [actionConfirmed, setActionConfirmed] = useState(false)

  const {
    decimalDivision,
    isMobile,
    completedFollowActions,
    notCompletedFollowActions,
    growthCampaignsRefetch,
    showNotification,
    wallet,
    walletProxy
  } = props
  return (
    <>
      <VerifyOrConfirmFollow
        showNotification={showNotification}
        currentAction={currentAction}
        setCurrentAction={setCurrentAction}
        actionConfirmed={actionConfirmed}
        setActionConfirmed={setActionConfirmed}
        decimalDivision={decimalDivision}
        growthCampaignsRefetch={growthCampaignsRefetch}
        wallet={wallet}
        walletProxy={walletProxy}
      />
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
                <fbt desc="GrowthFollowOrigin.followOrigin">Follow Origin</fbt>
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
            setActionConfirmed(false)
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
