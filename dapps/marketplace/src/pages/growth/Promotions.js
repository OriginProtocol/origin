import React, { useState } from 'react'
import { fbt } from 'fbt-runtime'
import Link from 'components/Link'
import { withRouter } from 'react-router-dom'
import withWallet from 'hoc/withWallet'

import ActionList from 'components/growth/ActionList'
import MobileModalHeader from 'components/MobileModalHeader'
import ShareableContent from 'components/growth/ShareableContent'

import { Mutation } from 'react-apollo'
import VerifyPromotionMutation from 'mutations/VerifyPromotion'
import AutoMutate from 'components/AutoMutate'

import { formatTokens, getContentToShare } from 'utils/growthTools'

import get from 'lodash/get'

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
  }

  return null
}

const getActionHash = action =>
  web3.utils.sha3(`${action.type}/${action.content.post.text.default}`)

const getActionFromHash = ({
  notCompletedPromotionActions,
  completedPromotionActions,
  contentId
}) => {
  if (!contentId) {
    return null
  }

  const selectedAction = [
    ...notCompletedPromotionActions,
    ...completedPromotionActions
  ].find(action => getActionHash(action) === contentId)

  return selectedAction
}

const PromotionContents = ({
  notCompletedPromotionActions,
  completedPromotionActions,
  onShare
}) => {
  return (
    <>
      {[...notCompletedPromotionActions, ...completedPromotionActions].map(
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
      )}
    </>
  )
}

const PromotionChannels = ({
  isMobile,
  decimalDivision,
  locale,
  action,
  history,
  onRunMutation
}) => {
  if (!action) {
    return history.push(`/campaigns/promotions`)
  }

  // TODO: As of now, there is only one growth rule per content AND social network.
  // This has to be updated once support for multiple channels for the same content is available

  return (
    <>
      {action.status === 'Completed' ? (
        <ActionList
          title={fbt('Completed', 'growth.promoteOrigin.completed')}
          decimalDivision={decimalDivision}
          isMobile={isMobile}
          actions={[action]}
        />
      ) : (
        <ActionList
          decimalDivision={decimalDivision}
          isMobile={isMobile}
          actions={[action]}
          locale={locale}
          onActionClick={() => {
            if (onRunMutation) {
              onRunMutation(action)
            }
          }}
        />
      )}
    </>
  )
}

const RunVerifyPromotion = ({
  action,
  locale,
  onCompleted,
  onError,
  wallet,
  walletProxy
}) => {
  return (
    <Mutation
      mutation={VerifyPromotionMutation}
      onCompleted={({ verifyPromotion }) => {
        const complete = verifyPromotion.success
        if (complete && onCompleted) {
          onCompleted(action)
        } else if (!complete && onError) {
          console.error('Verification timed out: ', verifyPromotion.reason)
          onError(verifyPromotion.reason)
        }
      }}
      onError={errorData => {
        console.error(`Failed to verify shared content`, errorData)
        if (onError) {
          onError(errorData)
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
                socialNetwork: actionTypeToNetwork(action.type),
                content: getContentToShare(action, locale)
              }
            })
          }}
        />
      )}
    </Mutation>
  )
}

const PromotionsHeader = ({ isMobile, hasSelectedContent, history }) => {
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
      <Link className="back d-flex mr-auto" to="/campaigns">
        <img src="images/caret-blue.svg" />
        <div>
          <fbt desc="GrowthPromotions.backToCampaign">Back to Campaign</fbt>
        </div>
      </Link>
      <h1 className={`mb-2 pt-md-3 mt-3`}>{stageTitle}</h1>
    </>
  )

  return (
    <div>
      {header}
      <div
        className={`promote-origin-subtitle${isMobile ? ' text-center' : ''}`}
      >
        {stageDesc}
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
  const [runMutation, setRunMutation] = useState(false)

  const contentId = get(props, 'match.params.contentId')
  const hasSelectedContent = contentId ? true : false
  const action = getActionFromHash({
    notCompletedPromotionActions,
    completedPromotionActions,
    contentId
  })

  return (
    <div className={`growth-promote-origin${isMobile ? ' mobile' : ''}`}>
      {runMutation && (
        <RunVerifyPromotion
          locale={locale}
          action={action}
          onCompleted={() => {
            if (showNotification) {
              const message = getToastMessage(action, decimalDivision)
              showNotification(message, 'green')
            }
            if (growthCampaignsRefetch) {
              growthCampaignsRefetch()
            }
            setRunMutation(false)
          }}
          onError={() => setRunMutation(false)}
          wallet={wallet}
          walletProxy={walletProxy}
        />
      )}
      <PromotionsHeader
        isMobile={isMobile}
        hasSelectedContent={hasSelectedContent}
        history={history}
      />
      {hasSelectedContent ? (
        <PromotionChannels
          isMobile={isMobile}
          decimalDivision={decimalDivision}
          locale={locale}
          action={action}
          history={history}
          onRunMutation={() => setRunMutation(true)}
        />
      ) : (
        <PromotionContents
          completedPromotionActions={completedPromotionActions}
          notCompletedPromotionActions={notCompletedPromotionActions}
          onShare={action => {
            // Note: Taking SHA3 hash just to push it to router
            // This hash has nothing to do with Growth Event contentHash
            const contentHash = getActionHash(action)
            history.push(`/campaigns/promotions/${contentHash}`)
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
`)
