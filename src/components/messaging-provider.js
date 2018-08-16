import { Component } from 'react'
import { defineMessages, injectIntl } from 'react-intl'
import { connect } from 'react-redux'
import { withRouter } from 'react-router'

import { setMessagingEnabled, setMessagingInitialized } from 'actions/App'
import { addMessage } from 'actions/Message'
import { fetchNotifications } from 'actions/Notification'

import origin from '../services/origin'

const ETH_ADDRESS = process.env.MESSAGING_ACCOUNT
const ONE_SECOND = 1000
const storeKeys = {
  messageCongratsTimestamp: 'message_congrats_timestamp',
  messageWelcomeTimestamp: 'message_welcome_timestamp'
}

class MessagingProvider extends Component {
  constructor(props) {
    super(props)

    this.intlMessages = defineMessages({
      congratsMessage: {
        id: 'messaging-provider.congrats',
        defaultMessage:
          'Congratulations! You can now message other users across the Origin Platform ecosystem! ' +
          'Why not start by taking a look around and telling us what you think about our DApp?'
      },
      welcomeMessage: {
        id: 'messaging-provider.welcome',
        defaultMessage:
          'Welcome to the Origin Protocol Demo DApp! ' +
          'Our innovative messaging platform allows you to communicate ' +
          'with other Origin users in a secure and decentralized way. ' +
          'All of your messages will be encrypted and stored on IPFS. ' +
          'Messages can only be read by you, the recipient, ' +
          'and potentially a third-party arbitrator if either of you initiates a dispute ' +
          'and grants access to a cryptographically-generated, shared, private key.\n' +
          '\n' +
          'In order to enable messaging you will need to use your Ethereum wallet to sign two statements. ' +
          'This will not cost any ETH, Origin Token, or gas.'
      }
    })
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

    // detect net decrypted messages
    origin.messaging.events.on('msg', obj => {
      this.props.addMessage(obj)
    })

    // To Do: handle incoming messages when no Origin Messaging Private Key is available
    origin.messaging.events.on('emsg', obj => {
      console.error('A message has arrived that could not be decrypted:', obj)
    })

    // poll for notifications
    setInterval(() => {
      this.props.fetchNotifications()
    }, 10 * ONE_SECOND)
  }

  componentDidUpdate(prevProps) {
    const {
      messages,
      messagingEnabled,
      messagingInitialized,
      web3Account
    } = this.props

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
      message.status = origin.messaging.getStatus(message, web3Account)
      this.props.addMessage(message)
    }
    // on messaging enabled
    if (messagingEnabled !== prevProps.messagingEnabled) {
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
      message.status = origin.messaging.getStatus(message, web3Account)
      this.props.addMessage(message)
    }
  }

  render() {
    return this.props.children
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
  setMessagingEnabled: bool => dispatch(setMessagingEnabled(bool)),
  setMessagingInitialized: bool => dispatch(setMessagingInitialized(bool))
})

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(injectIntl(MessagingProvider))
)
