import React, { Component, Fragment } from 'react'
import { defineMessages, injectIntl } from 'react-intl'
import { connect } from 'react-redux'
import { withRouter } from 'react-router'
import queryString from 'query-string'

import { setMessagingEnabled, setMessagingInitialized } from 'actions/App'
import { addMessage } from 'actions/Message'
import { fetchNotifications } from 'actions/Notification'
import { fetchUser } from 'actions/User'

import BetaModal from 'components/modals/beta-modal'
import SellingModal from 'components/onboarding-modal'

import scopedDebounce from 'utils/scopedDebounce'

import origin from '../services/origin'

const ETH_ADDRESS = process.env.MESSAGING_ACCOUNT
const ONE_SECOND = 1000
const storeKeys = {
  messageCongratsTimestamp: 'message_congrats_timestamp',
  messageWelcomeTimestamp: 'message_welcome_timestamp'
}

class Onboarding extends Component {
  constructor(props) {
    super(props)

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
          'In the case that either of you opens a dispute, messages can also be read by a third party arbitrator.\n' +
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

    // To Do: handle incoming messages when no Origin Messaging Private Key is available
    origin.messaging.events.on('emsg', obj => {
      console.error('A message has arrived that could not be decrypted:', obj)
    })
  }

  componentDidUpdate(prevProps) {
    const {
      messages,
      messagingEnabled,
      messagingInitialized,
      web3Account
    } = this.props

    if (web3Account && !this.notificationsInterval) {
      // poll for notifications
      this.notificationsInterval = setInterval(() => {
        this.props.fetchNotifications()
      }, 10 * ONE_SECOND)
    }

    const welcomeAccountEnabled = ETH_ADDRESS && ETH_ADDRESS !== web3Account

    if (
      // wait for initialization so that account key is available in origin.js
      !messagingInitialized ||
      // no need to spoof messages if there is no account to handle replies
      !welcomeAccountEnabled
    ) {
      return
    }

    const roomId = origin.messaging.generateRoomId(ETH_ADDRESS, web3Account)
    const recipients = origin.messaging.getRecipients(roomId)

    if (!messages.find(({ hash }) => hash === 'origin-welcome-message')) {
      this.debouncedFetchUser(ETH_ADDRESS)

      const scopedWelcomeMessageKeyName = `${
        storeKeys.messageWelcomeTimestamp
      }:${web3Account}`
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
        senderAddress: ETH_ADDRESS
      }
      message.status = origin.messaging.getStatus(message)
      this.props.addMessage(message)
    }
    // on messaging enabled
    if (messagingEnabled !== prevProps.messagingEnabled) {
      this.debouncedFetchUser(ETH_ADDRESS)

      const scopedCongratsMessageKeyName = `${
        storeKeys.messageCongratsTimestamp
      }:${web3Account}`
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
        senderAddress: ETH_ADDRESS
      }
      message.status = origin.messaging.getStatus(message)
      this.props.addMessage(message)
    }
  }

  render() {
    const { children, location } = this.props
    const query = queryString.parse(location.search)

    return (
      <Fragment>
        {children}
        {!query['skip-onboarding'] && (
          <Fragment>
            <BetaModal />
            <SellingModal />
          </Fragment>
        )}
      </Fragment>
    )
  }
}

const mapStateToProps = state => ({
  messages: state.messages,
  messagingEnabled: state.app.messagingEnabled,
  messagingInitialized: state.app.messagingInitialized,
  web3Account: state.app.web3.account
})

const mapDispatchToProps = dispatch => ({
  addMessage: obj => dispatch(addMessage(obj)),
  fetchNotifications: () => dispatch(fetchNotifications()),
  fetchUser: addr => dispatch(fetchUser(addr)),
  setMessagingEnabled: bool => dispatch(setMessagingEnabled(bool)),
  setMessagingInitialized: bool => dispatch(setMessagingInitialized(bool))
})

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(injectIntl(Onboarding))
)
