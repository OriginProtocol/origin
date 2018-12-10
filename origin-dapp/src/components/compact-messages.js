import React, { Component, Fragment } from 'react'
import origin from '../services/origin'
import { formattedAddress, abbreviateName } from 'utils/user'
import Message from 'components/message'
import moment from 'moment'

const MAX_MINUTES = 10

function getElapsedTime(recentTime, previousTime) {
  const toMinutes = 1000 * 60
  const elapsedTime = (recentTime - previousTime) / toMinutes

  return isNaN(elapsedTime) ? 0 : elapsedTime
}

export default class CompactMessages extends Component {
  render() {
    const { messages = [], purchase, purchaseEvents, formatOfferMessage } = this.props

    return messages.map((message, i) => {
      if (!message) return
      const { created, hash, senderAddress, event } = message
      const offerMessage = event

      if (offerMessage) return formatOfferMessage(message)

      const previousMessage = (i === 0 || !offerMessage) ? {} : messages[i - 1]
      const timeElapsed = getElapsedTime(created, previousMessage.created)
      const showTime = timeElapsed >= MAX_MINUTES || (i === 0 || !offerMessage)

      const sameSender = formattedAddress(senderAddress) === formattedAddress(previousMessage.senderAddress)
      const contentOnly = sameSender && timeElapsed < MAX_MINUTES

      return <Message key={hash} showTime={showTime} message={message} />
    })
  }
}
