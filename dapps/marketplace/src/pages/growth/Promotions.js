import React, { useState } from 'react'
import { fbt } from 'fbt-runtime'
import Link from 'components/Link'
import { withRouter } from 'react-router-dom'
import withWallet from 'hoc/withWallet'
import uniqBy from 'lodash/uniqBy'

import ActionList from 'components/growth/ActionList'
import MobileModalHeader from 'components/MobileModalHeader'
import ShareableContent from 'components/growth/ShareableContent'

import { Mutation } from 'react-apollo'
import VerifyPromotionMutation from 'mutations/VerifyPromotion'
import ConfirmSocialShare from 'mutations/ConfirmSocialShare'
import AutoMutate from 'components/AutoMutate'

import { formatTokens, getContentToShare } from 'utils/growthTools'

import get from 'lodash/get'

const GrowthEnum = require('Growth$FbtEnum')

const getToastMessage = (action, decimalDivision) => {
  const tokensEarned = formatTokens(action.reward.amount, decimalDivision)
  return fbt(
    `You earned ` + fbt.param('amount', tokensEarned) + ' OGN',
    'GrowthPromotions.tokensEarned'
  )
}

const actionTypeToNetwork = actionType => {
  switch (actionType) {
    case 'TwitterShare':
      return 'TWITTER'
    case 'FacebookShare':
      return 'FACEBOOK'
  }

  return null
}

const getApplicableActions = ({
  notCompletedPromotionActions,
  completedPromotionActions,
  contentId
}) => {
  if (!contentId) {
    return []
  }

  return [...notCompletedPromotionActions, ...completedPromotionActions].filter(
    action => action.content.id === contentId
  )
}

const PromotionContents = ({
  notCompletedPromotionActions,
  completedPromotionActions,
  onShare
}) => {
  return (
    <>
      {
        uniqBy([...notCompletedPromotionActions, ...completedPromotionActions], 'content.id')
          .map(
            (action, index) => (
              <ShareableContent
                key={index}
                onShare={() => {
                  if (onShare) {
                    onShare(action)
                  }
                }}
                action={action}
              />
            )
          )
        }
    </>
  )
}

const PromotionChannels = ({
  isMobile,
  decimalDivision,
  locale,
  applicableActions,
  history,
  setActionToVerify
}) => {
  if (applicableActions.length === 0) {
    return history.push(`/campaigns/promotions`)
  }

  const completedActions = applicableActions.filter(
    action => action.status === 'Completed'
  )
  const notCompletedActions = applicableActions.filter(
    action => action.status !== 'Completed'
  )
  // TODO: As of now, there is only one growth rule per content AND social network.
  // This has to be updated once support for multiple channels for the same content is available

  return (
    <>
      {notCompletedActions.length > 0 && (
        <ActionList
          decimalDivision={decimalDivision}
          isMobile={isMobile}
          actions={notCompletedActions}
          locale={locale}
          onActionClick={(action) => {
            if (setActionToVerify) {
              setActionToVerify(action)
            }
          }}
        />
      )}
      {completedActions.length > 0 && (
        <ActionList
          title={fbt('Completed', 'growth.promoteOrigin.completed')}
          decimalDivision={decimalDivision}
          isMobile={isMobile}
          actions={completedActions}
        />
      )}
    </>
  )
}

const RunVerifyPromotion = ({
  action,
  actionConfirmed,
  locale,
  onVerificationCompleted,
  onConfirmationCompleted,
  onVerificationError,
  onConfirmationError,
  wallet,
  walletProxy
}) => {
  const socialNetwork = actionTypeToNetwork(action.type)
  return (
    <>
      {socialNetwork === 'TWITTER' && <Mutation
        mutation={VerifyPromotionMutation}
        onCompleted={({ verifyPromotion }) => {
          const complete = verifyPromotion.success
          if (complete && onVerificationCompleted) {
            onVerificationCompleted(action)
          } else if (!complete && onError) {
            console.error('Verification timed out: ', verifyPromotion.reason)
            onError(verifyPromotion.reason)
          }
        }}
        onError={errorData => {
          console.error(`Failed to verify shared content`, errorData)
          if (onVerificationError) {
            onVerificationError(errorData)
          }
        }}
      >
        {verifyPromotion => (
          <AutoMutate
            mutation={() => {
              verifyPromotion({
                variables: {
                  type: 'SHARE',
                  identity: wallet,
                  identityProxy: walletProxy,
                  socialNetwork: socialNetwork,
                  content: getContentToShare(action, locale)
                }
              })
            }}
          />
        )}
      </Mutation>}
      {!actionConfirmed && socialNetwork === 'FACEBOOK' && <Mutation
        mutation={ConfirmSocialShare}
        onCompleted={({ confirmSocialShare }) => {
          // if successful
          if (confirmSocialShare) {
            if (onConfirmationCompleted) {
              onConfirmationCompleted()
            }
          } else {
            if (onConfirmationError) {
              onConfirmationError('unknown')
            }
          }        
        }}
        onError={errorData => {
          if (onConfirmationError)
            onConfirmationError(errorData)          
        }}
      >
        {confirmSocialShare => (
          <AutoMutate
            mutation={() => {
              confirmSocialShare({
                variables: {
                  contentId: action.content.id,
                  actionType: action.type,
                }
              })
            }}
          />
        )}
      </Mutation>}
    </>
  )
}

const ActionLinkPreview = ({ action }) => {
  if (!action || !action.content || !action.content.link) {
    return null
  }

  const { titleKey, image } = action.content
  const title = GrowthEnum[titleKey] || titleKey

  return (
    <div className="action-link-preview">
      <img src={image} />
      <h3>{title}</h3>
    </div>
  )
}

const PromotionsHeader = ({
  isMobile,
  hasSelectedContent,
  history,
  action
}) => {
  const stageTitle = (
    <>
      {!hasSelectedContent ? (
        <fbt desc="GrowthPromotions.promoteOrigin">Promote Origin</fbt>
      ) : null}
      {hasSelectedContent ? (
        <fbt desc="GrowthPromotions.selectChannels">Select Social Channels</fbt>
      ) : null}
    </>
  )

  const stageDesc = (
    <>
      {!hasSelectedContent ? (
        <fbt desc="GrowthPromotions.earnBySharing">
          Select an article or video about Origin and share it on your social
          channels.
        </fbt>
      ) : null}
      {hasSelectedContent ? (
        <fbt desc="GrowthPromotions.selectChannelToShare">
          Where would you like to share this? Select more channels for more
          rewards!
        </fbt>
      ) : null}
    </>
  )

  const header = isMobile ? (
    <MobileModalHeader
      showBackButton={true}
      className="px-0"
      onBack={() => {
        history.goBack()
      }}
    >
      {stageTitle}
    </MobileModalHeader>
  ) : (
    <>
      <Link
        className="back d-flex mr-auto"
        to={hasSelectedContent ? '/campaigns/promotions' : '/campaigns'}
      >
        <img src="images/caret-blue.svg" />
        <div>
          {hasSelectedContent && (
            <fbt desc="GrowthPromotions.backToPromotions">
              Back to Promotions
            </fbt>
          )}
          {!hasSelectedContent && (
            <fbt desc="GrowthPromotions.backToCampaign">Back to Campaign</fbt>
          )}
        </div>
      </Link>
      <h1 className={`mb-2 pt-md-3 mt-3`}>{stageTitle}</h1>
    </>
  )

  return (
    <div className="header-holder">
      {header}
      <div
        className={`promote-origin-subtitle${isMobile ? ' text-center' : ''}`}
      >
        {stageDesc}
        <ActionLinkPreview action={action} />
      </div>
    </div>
  )
}

const Promotions = ({
  notCompletedPromotionActions,
  completedPromotionActions,
  locale,
  history,
  isMobile,
  decimalDivision,
  wallet,
  walletProxy,
  growthCampaignsRefetch,
  showNotification,
  ...props
}) => {
  const [actionToVerify, setActionToVerify] = useState(null)
  const [actionConfirmed, setActionConfirmed] = useState(false)

  const contentId = get(props, 'match.params.contentId')
  const hasSelectedContent = contentId ? true : false
  const applicableActions = getApplicableActions({
    notCompletedPromotionActions,
    completedPromotionActions,
    contentId
  })

  return (
    <div
      className={`growth-promote-origin d-flex flex-wrap ${
        isMobile ? ' mobile' : ''
      }`}
    >
      {actionToVerify && (
        <RunVerifyPromotion
          locale={locale}
          action={actionToVerify}
          actionConfirmed={actionConfirmed}
          onVerificationCompleted={() => {
            if (showNotification) {
              const message = getToastMessage(actionToVerify, decimalDivision)
              showNotification(message, 'green')
            }
            if (growthCampaignsRefetch) {
              growthCampaignsRefetch()
            }
            setActionToVerify(null)
          }}
          onVerificationError={() => setActionToVerify(null)}
          onConfirmationCompleted={() => {
            setActionConfirmed(true)
            if (growthCampaignsRefetch) {
              growthCampaignsRefetch()
            }
          }}
          onConfirmationError={(error) => {
            console.error(`Failed to confirm shared content`, error)
          }}
          wallet={wallet}
          walletProxy={walletProxy}
        />
      )}
      <PromotionsHeader
        isMobile={isMobile}
        hasSelectedContent={hasSelectedContent}
        history={history}
        action={applicableActions.length > 0 ? applicableActions[0] : null}
      />
      {hasSelectedContent ? (
        <PromotionChannels
          isMobile={isMobile}
          decimalDivision={decimalDivision}
          locale={locale}
          applicableActions={applicableActions}
          history={history}
          setActionToVerify={(action) => {
            setActionConfirmed(false)
            setActionToVerify(action)
          }}
        />
      ) : (
        <PromotionContents
          completedPromotionActions={completedPromotionActions}
          notCompletedPromotionActions={notCompletedPromotionActions}
          onShare={action => {
            history.push(`/campaigns/promotions/${action.content.id}`)
          }}
        />
      )}
    </div>
  )
}

export default withWallet(withRouter(Promotions))

require('react-styl')(`
  .growth-promote-origin.mobile
    .promote-origin-subtitle
      font-size: 16px
  .growth-promote-origin
    margin: 0 -1.25rem
    .header-holder
      margin: 0 1.25rem
      width: 100%
    .promote-origin-subtitle
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
  .action-link-preview
    display: flex
    background-color: #f3f7f9
    padding: 0.75rem
    border-radius: 10px
    margin: 1rem 0
    img
      flex: 5rem 0 0
      max-width: 5rem
      height: auto
      max-height: 4rem
      object-fit: contain
    h3
      margin: 0
      padding-left: 0.75rem
      text-align: left
      font-weight: bold
      color: #0d1d29

  @media (max-width: 767.98px)
    .growth-promote-origin
      margin: 0
      .header-holder
        margin: 0
`)
