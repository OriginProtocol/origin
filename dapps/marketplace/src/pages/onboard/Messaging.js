import React, { useState } from 'react'
import { useMutation } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import { fbt } from 'fbt-runtime'
import { withRouter } from 'react-router-dom'

import withIsMobile from 'hoc/withIsMobile'
import withMessagingStatus from 'hoc/withMessagingStatus'

import MobileModal from 'components/MobileModal'
import Link from 'components/Link'
import MetaMaskAnimation from 'components/MetaMaskAnimation'
import HelpOriginWallet from 'components/DownloadApp'
import ListingPreview from './_ListingPreview'
import HelpMessaging from './_HelpMessaging'

const EnableMessagingMutation = gql`
  mutation enableMessaging {
    enableMessaging
  }
`

const MessagingInitializing = () => (
  <div className="onboard-box">
    <div className="messaging-logo" />
    <div className="status">
      <fbt desc="onboard.Messaging.originMessaging">Origin Messaging</fbt>
    </div>
    <div className="spinner" />
  </div>
)

const MessagingSyncing = ({ pct }) => (
  <div className="onboard-box messaging-sync">
    <div className="messaging-logo" />
    <div className="status">
      <fbt desc="onboard.Messaging.syncing">Origin Messaging Syncing</fbt>
    </div>
    <div className="progress">
      <div className="progress-bar" style={{ width: pct }} />
    </div>
  </div>
)

const EnableMessaging = ({ firstMessageSigned, buttons, error }) => {
  return (
    <div className="onboard-box">
      <div className="messaging-logo" />
      <div className="status">
        <fbt desc="onboard.Messaging.originMessaging">Origin Messaging</fbt>
      </div>
      <div className="connected">
        <span className={`oval ${firstMessageSigned ? '' : 'warn'}`} />
        <span className="oval warn" />
        <fbt desc="onboard.Messaging.zeroOfTwoSigned">
          {' '}
          <fbt:param name="messageNumber">
            {firstMessageSigned ? '1' : '0'}
          </fbt:param>{' '}
          of 2 MetaMask messages signed
        </fbt>
      </div>

      {error && <div className="help error">{error}</div>}
      <div className="help mb">
        <fbt desc="onboard.Messaging.capabilities">
          Messaging will allow you to chat with other buyers and sellers.
        </fbt>
      </div>
      {buttons}
    </div>
  )
}

const SignMessage = ({ num, buttons }) => (
  <div className="onboard-box">
    <MetaMaskAnimation light />
    <div className="status">
      <fbt desc="onboard.Messaging.waitingOnSigning">
        Waiting for you to sign message number{' '}
        <fbt:param name="messageNumber">{num}</fbt:param>
      </fbt>
    </div>
    <div className="connected">
      <span className={`oval ${num === 2 ? '' : 'warn'}`} />
      <span className={`oval warn`} />
      <fbt desc="onboard.Messaging.signedNumMessages">
        <fbt:param name="messageNumber">{num === 2 ? '1' : '0'}</fbt:param> of 2
        MetaMask messages signed
      </fbt>
    </div>

    <div className="help">
      <fbt desc="onboard.Messaging.metamaskIcon">
        The Metamask icon is located on the top right of your browser tool bar.
      </fbt>
    </div>
    {buttons}
    <div className="click-metamask-extension" />
  </div>
)

const MessagingEnabled = ({ nextLink }) => (
  <div className="onboard-box">
    <div className="messaging-logo">
      <div className="qm active" />
    </div>
    <div className="status">
      <fbt desc="onboard.Messaging.enabled">Messaging Enabled</fbt>
    </div>
    <div className="connected">
      <span className="oval" />
      <span className="oval" />
      <fbt desc="onboard.Messaging.TwoOfTwoSigned">
        {' '}
        2 of 2 MetaMask messages signed
      </fbt>
    </div>
    <div className="help">
      <fbt desc="onboard.Messaging.congrats">
        Congratulations! You can now message other users on Origin and stay up
        to date with all your purchases and sales.
      </fbt>
    </div>
    <em>
      <fbt desc="onboard.Messaging.done">
        You’re done and can continue by pressing the button below.
      </fbt>
    </em>
    <div className="continue-btn">
      {nextLink && (
        <Link to={nextLink} className="btn btn-primary">
          <fbt desc="onboard.Messaging.continue">Continue</fbt>
        </Link>
      )}
    </div>
  </div>
)

const EnableMessagingButtons = ({ next, showButtons, onError }) => {
  const [enableMessaging] = useMutation(EnableMessagingMutation)
  if (!showButtons) return null

  return (
    <>
      <button
        className="btn btn-primary btn-rounded"
        type="submit"
        onClick={async () => {
          next()
          try {
            await enableMessaging()
          } catch (e) {
            onError()
            console.log('Error enabling messaging:', e.message)
          }
        }}
        children={fbt('Enable Origin Messaging', 'Enable Origin Messaging')}
      />
    </>
  )
}

const OnboardMessagingRaw = ({
  messagingStatusError,
  messagingStatusLoading,
  messagingStatus,
  nextLink,
  messagingKeysLoading
}) => {
  const [waitForSignature, setWaitForSignature] = useState(false)
  const [signatureError, setSignatureError] = useState(null)

  if (messagingStatusLoading || messagingKeysLoading) {
    return <MessagingInitializing />
  } else if (messagingStatusError) {
    return (
      <p className="p-3">
        <fbt desc="Error">Error</fbt>
      </p>
    )
  } else if (!messagingStatus || !messagingStatus.messaging) {
    return (
      <p className="p-3">
        <fbt desc="No Web3">No Web3</fbt>
      </p>
    )
  }

  const firstMessageSigned = messagingStatus.messaging.pubKey
  const secondMessageSigned = messagingStatus.messaging.pubSig
  const buttons = (
    <EnableMessagingButtons
      next={() => {
        setSignatureError(null)
        setWaitForSignature(true)
      }}
      onError={() => {
        setSignatureError(
          fbt(
            'An unexpected error has occurred.',
            'onboard.Messaging.errorEnablingMessaging'
          )
        )
        setWaitForSignature(false)
      }}
      showButtons={!waitForSignature}
    />
  )

  let cmp
  if (!messagingStatus.messaging.synced) {
    cmp = <MessagingSyncing pct={messagingStatus.messaging.syncProgress} />
  } else if (!messagingStatus.messaging.enabled && !waitForSignature) {
    cmp = (
      <EnableMessaging
        firstMessageSigned={firstMessageSigned}
        buttons={buttons}
        error={signatureError}
      />
    )
  } else if (!firstMessageSigned) {
    cmp = <SignMessage num={1} buttons={buttons} />
  } else if (!secondMessageSigned) {
    cmp = <SignMessage num={2} buttons={buttons} />
  } else {
    cmp = <MessagingEnabled nextLink={nextLink} />
  }

  return cmp
}

const OnboardMessaging = withMessagingStatus(OnboardMessagingRaw)

const Messaging = ({
  listing,
  linkPrefix,
  isMobile,
  hideOriginWallet,
  history
}) => {
  const nextLink = `${linkPrefix}/onboard/rewards`

  const content = <OnboardMessaging nextLink={nextLink} />

  if (isMobile) {
    return (
      <MobileModal
        title={fbt('Enable Messaging', 'onboard.Messaging.enableMessaging')}
        onBack={() => history.goBack()}
        className="profile-email"
      >
        {content}
      </MobileModal>
    )
  }

  return (
    <>
      <h1 className="mb-1">
        <fbt desc="onboard.Profile.createAccount">Create an Account</fbt>
      </h1>
      <p className="description mb-5">
        <fbt desc="onboard.Profile.description">
          Create a basic profile so others will know who you are in the Origin
          Marketplace.
        </fbt>
      </p>
      <div className="row">
        <div className="col-md-8">{content}</div>
        <div className="col-md-4">
          <ListingPreview listing={listing} />
          {hideOriginWallet ? null : <HelpOriginWallet />}
          <HelpMessaging />
        </div>
      </div>
    </>
  )
}

export default withRouter(withIsMobile(Messaging))

require('react-styl')(`
  .onboard-box
    .help.error
      color: var(--red)
      font-size: 18px
      font-weight: 400
      margin: 0
    .messaging-logo
      margin-bottom: 1rem
      width: 10rem
      height: 10rem
      background: url(images/chat-bubble-icon-blue.svg) no-repeat center
      background-size: contain
      position: relative
      .qm.active
        background-size: 2rem;
        width: 3.5rem
        height: 3.5rem
        right: -1.5rem
  .messaging-sync > .progress
    width: 50%
    margin-top: 2rem
`)
