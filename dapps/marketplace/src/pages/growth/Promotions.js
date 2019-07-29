import React from 'react'
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

import ToastNotification from 'pages/user/ToastNotification'
import { formatTokens, getContentToShare } from 'utils/growthTools'

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

class Promotions extends React.Component {
  constructor() {
    super()

    this.state = {
      stage: 'Contents',
      selectedAction: null,
      runVerifyMutation: false
    }
  }

  render() {
    return (
      <>
        <ToastNotification
          setShowHandler={handler => (this.handleShowNotification = handler)}
        />
        {this.renderVerifyMutation()}
        <div className={`growth-promote-origin${this.props.isMobile ? ' mobile' : ''}`}>
          {this.renderHeader()}
          {this[`render${this.state.stage}`]()}
        </div>
      </>
    )
  }

  renderContents() {
    return (
      <>
        {this.props.notCompletedPromotionActions.map((action, index) => (
          <ShareableContent
            key={index}
            onShare={() => {
              this.setState({
                selectedAction: action,
                stage: 'Channels'
              })
            }}
            action={action}
          />
        ))}
      </>
    )
  }

  renderChannels() {
    const {
      decimalDivision,
      isMobile,
      locale
    } = this.props

    const {
      selectedAction
    } = this.state

    // TODO: As of now, there is only one growth rule per content AND social network.
    // This has to be updated once support for multiple channels for the same content is available

    return (
      <>
        {selectedAction.status === 'Completed' ? (
          <ActionList
            title={fbt('Completed', 'growth.promoteOrigin.completed')}
            decimalDivision={decimalDivision}
            isMobile={isMobile}
            actions={[selectedAction]}
          />
        ) : (
          <ActionList
            decimalDivision={decimalDivision}
            isMobile={isMobile}
            actions={[selectedAction]}
            locale={locale}
            onActionClick={() => {
              this.setState({
                runVerifyMutation: true
              })
            }}
          />
        )}
      </>
    )
  }

  renderVerifyMutation() {
    const { selectedAction, runVerifyMutation } = this.state

    if (!runVerifyMutation) {
      return null
    }
  
    const {
      decimalDivision,
      locale
    } = this.props

    return (
      <Mutation
        mutation={VerifyPromotionMutation}
        onCompleted={({ verifyPromotion }) => {
          if (verifyPromotion.success) {
            const message = getToastMessage(selectedAction, decimalDivision)
            this.handleShowNotification(message, 'green')
            // TODO: Should a query refetch be done here?
          }
          this.setState({ runVerifyMutation: false })
        }}
      >
        {verifyPromotion => (
          <AutoMutate
            mutation={() => {
              verifyPromotion({
                variables: {
                  type: 'SHARE',
                  identity: this.props.wallet,
                  identityProxy: this.props.walletProxy,
                  socialNetwork: actionTypeToNetwork(selectedAction.type),
                  content: getContentToShare(selectedAction, locale)
                }
              })
            }}
          />
        )}
      </Mutation>
    )
  }

  renderHeader() {
    const { isMobile } = this.props
    const { stage } = this.state

    const stageTitle = (
      <>
        {stage === 'Contents' ? <fbt desc="GrowthPromotions.promoteOrigin">Promote Origin</fbt> : null}
        {stage === 'Channels' ? <fbt desc="GrowthPromotions.selectChannels">Select Social Channels</fbt> : null}
      </>
    )

    const stageDesc = (
      <>
        {stage === 'Contents' ? (
          <fbt desc="GrowthPromotions.earnBySharing">
            Select an article or video about Origin and share it on your social channels.
          </fbt>
        ) : null}
        {stage === 'Channels' ? (
          <fbt desc="GrowthPromotions.selectChannelToShare">
            Where would you like to share this video? Select more channels for more rewards!
          </fbt>
        ) : null}
      </>
    )

    const header = isMobile ? (
      <MobileModalHeader
        showBackButton={true}
        className="px-0"
        onBack={() => {
          if (stage === 'Channels') {
            return this.setState({
              stage: 'Contents'
            })
          }

          this.props.history.push('/campaigns')
        }}
      >
        {stageTitle}
      </MobileModalHeader>
    ) : (
      <>
        <Link className="back d-flex mr-auto" to="/campaigns">
          <img src="images/caret-blue.svg" />
          <div>
            <fbt desc="GrowthPromotions.backToCampaign">
              Back to Campaign
            </fbt>
          </div>
        </Link>
        <h1 className={`mb-2 pt-md-3 mt-3`}>
          {stageTitle}
        </h1>
      </>
    )

    return (
      <div>
        {header}
        <div
          className={`promote-origin-subtitle${
            isMobile ? ' text-center' : ''
          }`}
        >
          {stageDesc}
        </div>
      </div>
    )
  }

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
