import React, { Component, Fragment } from 'react'
import { defineMessages, FormattedMessage, injectIntl } from 'react-intl'
import { connect } from 'react-redux'
import { withRouter } from 'react-router'
import queryString from 'query-string'

import {
  enableMessaging,
  handleNotificationsSubscription,
  setMessagingEnabled,
  setMessagingInitialized,
  setNotificationsHardPermission,
  setNotificationsSoftPermission
} from 'actions/Activation'
import { storeWeb3Intent } from 'actions/App'
import { addMessage } from 'actions/Message'
import { fetchNotifications } from 'actions/Notification'
import { fetchUser } from 'actions/User'

import BetaModal from 'components/modals/beta-modal'
import Modal from 'components/modal'
import {
  RecommendationModal,
  WarningModal
} from 'components/modals/notifications-modals'

import getCurrentNetwork from 'utils/currentNetwork'
import { createSubscription, requestPermission } from 'utils/notifications'
import scopedDebounce from 'utils/scopedDebounce'
import { formattedAddress } from 'utils/user'

import analytics from '../services/analytics'
import origin from '../services/origin'

const { web3 } = origin.contractService
const ONE_SECOND = 1000
const storeKeys = {
  messageCongratsTimestamp: 'message_congrats_timestamp',
  messageWelcomeTimestamp: 'message_welcome_timestamp'
}

class Onboarding extends Component {
  constructor(props) {
    super(props)

    this.handleDismissNotificationsPrompt = this.handleDismissNotificationsPrompt.bind(
      this
    )
    this.handleDismissNotificationsWarning = this.handleDismissNotificationsWarning.bind(
      this
    )
    this.handleEnableNotifications = this.handleEnableNotifications.bind(this)
    this.handleToggle = this.handleToggle.bind(this)
    this.intlMessages = defineMessages({
      congratsMessage: {
        id: 'onboarding.congrats',
        defaultMessage:
          'Congratulations! You can now message other users on Origin. ' +
          'Why not start by taking a look around and telling us what you think about our DApp?'
      },
      welcomeMessage: {
        id: 'onboarding.welcome',
        defaultMessage:
          'You can use Origin Messaging to chat with other users. ' +
          'Origin Messaging allows you to communicate with other users in a secure and decentralized way. ' +
          'Messages are private and, usually, can only be read by you or the recipient. ' +
          'In the case that either of you opens a dispute, messages can also be read by a third-party arbitrator.\n' +
          '\n' +
          'Get started with messaging in two steps. ' +
          'First, you will use your Ethereum wallet to enable Origin Messaging. ' +
          'Then you will sign your public messaging key so that other users can find and chat with you. ' +
          'Using Origin Messaging is free and will not cost you any ETH or Origin Token.'
      }
    })
    // ? consider using https://www.npmjs.com/package/redux-debounced
    this.debouncedFetchUser = scopedDebounce(
      addr => this.props.fetchUser(addr),
      ONE_SECOND
    )

    this.notificationsInterval = null
  }

  componentDidMount() {
    // detect loading of global keys database
    origin.messaging.events.on('initialized', accountKey => {
      this.props.setMessagingInitialized(!!accountKey)
    })

    // detect existing messaging account
    // (potentially redundant if detectMessagingEnabled already returned true)
    origin.messaging.events.on('ready', accountKey => {
      this.props.setMessagingEnabled(!!accountKey)
    })

    // detect new decrypted messages
    origin.messaging.events.on('msg', obj => {
      if (obj.decryption) {
        const { roomId, keys } = obj.decryption

        origin.messaging.initRoom(roomId, keys)
      }

      this.props.addMessage(obj)

      this.debouncedFetchUser(obj.senderAddress)
    })

    setTimeout(() => this.props.fetchNotifications(), 1000 * 10)

    // To Do: handle incoming messages when no Origin Messaging Private Key is available
    origin.messaging.events.on('emsg', obj => {
      // Commenting this out for now [micah]
      // This event may be legitimate if a user is missing the key in this browser but is listed in the global registry.
      // Otherwise, this event may be the result of a race condition that can be resolved with a browser reload.
      // analytics.event('Notifications', 'ErrorNoDecryption')
      console.error('A message has arrived that could not be decrypted:', obj)
    })

    // Delay notifications retrieval to avoid flickering dropdown menus.
    setTimeout(() => {
      this.props.fetchNotifications()
    }, 10 * ONE_SECOND)
  }

  componentDidUpdate(prevProps) {
    const {
      messages,
      messagingEnabled,
      messagingInitialized,
      wallet
    } = this.props

    if (wallet.address && !this.notificationsInterval) {
      // Poll for notifications every 60 seconds.
      this.notificationsInterval = setInterval(() => {
        this.props.fetchNotifications()
      }, 60 * ONE_SECOND)
    }

    const supportAccount = this.props.messagingRequired
    const welcomeAccountEnabled = supportAccount &&
      formattedAddress(supportAccount) !== formattedAddress(wallet.address)

    if (
      // wait for initialization so that account key is available in origin.js
      !messagingInitialized ||
      // no need to spoof messages if there is no account to handle replies
      !welcomeAccountEnabled
    ) {
      return
    }

    const roomId = origin.messaging.generateRoomId(supportAccount, wallet.address)
    const recipients = origin.messaging.getRecipients(roomId)

    if (!messages.find(({ hash }) => hash === 'origin-welcome-message')) {
      this.debouncedFetchUser(supportAccount)

      const scopedWelcomeMessageKeyName = `${
        storeKeys.messageWelcomeTimestamp
      }:${wallet.address}`
      const welcomeTimestampString = localStorage.getItem(
        scopedWelcomeMessageKeyName
      )
      const welcomeTimestamp = welcomeTimestampString
        ? new Date(+welcomeTimestampString)
        : Date.now()
      !welcomeTimestampString &&
        localStorage.setItem(
          scopedWelcomeMessageKeyName,
          JSON.stringify(welcomeTimestamp)
        )
      // spoof a welcome message á la Tom from MySpace
      const message = {
        created: welcomeTimestamp,
        content: this.props.intl.formatMessage(
          this.intlMessages.welcomeMessage
        ),
        hash: 'origin-welcome-message',
        index: -2,
        recipients,
        roomId,
        senderAddress: supportAccount
      }
      message.status = origin.messaging.getStatus(message)
      this.props.addMessage(message)
    }
    // on messaging enabled
    if (messagingEnabled !== prevProps.messagingEnabled) {
      this.debouncedFetchUser(supportAccount)

      const scopedCongratsMessageKeyName = `${
        storeKeys.messageCongratsTimestamp
      }:${wallet.address}`
      const congratsTimestampString = localStorage.getItem(
        scopedCongratsMessageKeyName
      )
      const congratsTimestamp = congratsTimestampString
        ? new Date(+congratsTimestampString)
        : Date.now()
      !congratsTimestampString &&
        localStorage.setItem(
          scopedCongratsMessageKeyName,
          JSON.stringify(congratsTimestamp)
        )
      // spoof congratulations
      const message = {
        created: congratsTimestamp,
        content: this.props.intl.formatMessage(
          this.intlMessages.congratsMessage
        ),
        hash: 'origin-congrats-message',
        index: -1,
        recipients,
        roomId,
        senderAddress: supportAccount
      }
      message.status = origin.messaging.getStatus(message)
      this.props.addMessage(message)
    }
  }

  handleDismissNotificationsPrompt(e) {
    e.preventDefault()
    analytics.event('Notifications', 'PromptDismissed')
    this.props.handleNotificationsSubscription('warning', this.props)
  }

  handleDismissNotificationsWarning(e) {
    e.preventDefault()
    analytics.event('Notifications', 'WarningDismissed')
    this.props.setNotificationsSoftPermission('denied')
    this.props.handleNotificationsSubscription(null, this.props)
  }

  async handleEnableNotifications() {
    analytics.event('Notifications', 'SoftPermissionGranted')
    this.props.setNotificationsSoftPermission('granted')
    this.props.handleNotificationsSubscription(null, this.props)

    const { serviceWorkerRegistration, wallet } = this.props
    // need a registration object to subscribe
    if (!serviceWorkerRegistration) {
      analytics.event('Notifications', 'UnsupportedNoServiceWorker')
      return console.error('No service worker registered')
    }

    try {
      // will equal 'granted' or otherwise throw
      await requestPermission()
      analytics.event('Notifications', 'PermissionGranted')
      createSubscription(serviceWorkerRegistration, wallet.address)
    } catch (error) {
      // permission not granted
      analytics.event('Notifications', 'PermissionNotGranted', error)
      console.error(error)
    }

    this.props.setNotificationsHardPermission(Notification.permission)
  }

  handleToggle(e) {
    e.preventDefault()

    this.props.storeWeb3Intent(null)
  }

  render() {
    const {
      children,
      enableMessaging,
      location,
      messagingEnabled,
      messagingRequired,
      networkId,
      notificationsSubscriptionPrompt,
      web3Intent
    } = this.props
    const query = queryString.parse(location.search)
    const currentNetwork = getCurrentNetwork(networkId)
    const networkType = currentNetwork && currentNetwork.type

    return (
      <Fragment>
        {children}
        {!query['skip-onboarding'] && (
          <Fragment>
            {networkType === 'Mainnet' && <BetaModal />}
          </Fragment>
        )}
        {['buyer', 'seller'].includes(notificationsSubscriptionPrompt) && (
          <RecommendationModal
            isOpen={true}
            role={notificationsSubscriptionPrompt}
            onCancel={this.handleDismissNotificationsPrompt}
            onSubmit={this.handleEnableNotifications}
          />
        )}
        {notificationsSubscriptionPrompt === 'warning' && (
          <WarningModal
            isOpen={true}
            onCancel={this.handleDismissNotificationsWarning}
            onSubmit={this.handleEnableNotifications}
          />
        )}
        {!web3.currentProvider.isOrigin &&
          web3Intent &&
          web3Intent !== 'manage your profile' &&
          messagingRequired && !messagingEnabled && (
            <Modal
              backdrop="static"
              className="not-messaging-enabled"
              isOpen={true}
            >
              <FormattedMessage
                id={'onboarding.intentRequiresMessaging'}
                defaultMessage={
                  'Before you can {web3Intent}, you need to enable Origin Messaging.'
                }
                values={{ web3Intent }}
              />
              <a
                className="close"
                aria-label="Close"
                onClick={this.handleToggle}
              >
                <span aria-hidden="true">&times;</span>
              </a>
              <br />
              <div className="roadblock">
                <div className="button-container">
                  <button
                    className="btn btn-sm btn-clear"
                    onClick={enableMessaging}
                    ga-category="messaging"
                    ga-label="required_enable"
                  >
                    <FormattedMessage
                      id={'onboarding.enable'}
                      defaultMessage={'Enable Messaging'}
                    />
                  </button>
                </div>
                <div className="link-container text-center">
                  <a
                    href="#"
                    data-modal="profile"
                    onClick={this.handleToggle}
                    ga-category="messaging"
                    ga-label="required_cancel"
                  >
                    <FormattedMessage
                      id={'onboarding.cancel'}
                      defaultMessage={'Cancel'}
                    />
                  </a>
                </div>
              </div>
            </Modal>
          )}
      </Fragment>
    )
  }
}

const mapStateToProps = ({ activation, app, messages, wallet }) => ({
  messages,
  messagingEnabled: activation.messaging.enabled,
  messagingRequired: app.messagingRequired,
  messagingInitialized: activation.messaging.initialized,
  networkId: app.web3.networkId,
  notificationsHardPermission: activation.notifications.permissions.hard,
  notificationsSoftPermission: activation.notifications.permissions.soft,
  notificationsSubscriptionPrompt: activation.notifications.subscriptionPrompt,
  pushNotificationsSupported: activation.notifications.pushEnabled,
  serviceWorkerRegistration: activation.notifications.serviceWorkerRegistration,
  wallet,
  web3Intent: app.web3.intent
})

const mapDispatchToProps = dispatch => ({
  addMessage: obj => dispatch(addMessage(obj)),
  enableMessaging: () => dispatch(enableMessaging()),
  fetchNotifications: () => dispatch(fetchNotifications()),
  fetchUser: addr => dispatch(fetchUser(addr)),
  handleNotificationsSubscription: (role, props) =>
    dispatch(handleNotificationsSubscription(role, props)),
  setMessagingEnabled: bool => dispatch(setMessagingEnabled(bool)),
  setMessagingInitialized: bool => dispatch(setMessagingInitialized(bool)),
  setNotificationsHardPermission: result =>
    dispatch(setNotificationsHardPermission(result)),
  setNotificationsSoftPermission: result =>
    dispatch(setNotificationsSoftPermission(result)),
  storeWeb3Intent: () => dispatch(storeWeb3Intent())
})

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(injectIntl(Onboarding))
)
