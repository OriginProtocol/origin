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
    const {
      messages = [],
      purchaseEvents,
      formatOfferMessage,
      smallScreenOrDevice,
      withListingSummary
    } = this.props

    return messages.map((message, i) => {
      if (!message) return
      const { created, hash, senderAddress, timestamp } = message
      const offerMessage = timestamp

      if (offerMessage) {
        // I should do this in the conversation component
        if (!smallScreenOrDevice && withListingSummary) {
          return formatOfferMessage(message)
        } else {
          return
        }
      }

      const firstMessage = i === 0
      const previousOfferMessage = messages[i - 1] && messages[i - 1].timestamp
      const previousMessage = (firstMessage || previousOfferMessage) ? {} : messages[i - 1]
      const timeElapsed = getElapsedTime(created, previousMessage.created)
      const showTime = previousOfferMessage || timeElapsed >= MAX_MINUTES || firstMessage

      const sameSender = formattedAddress(senderAddress) === formattedAddress(previousMessage.senderAddress)
      const contentOnly = sameSender && timeElapsed < MAX_MINUTES

      return <Message key={hash} showTime={showTime} message={message} contentOnly={contentOnly}/>
    })
  }
}
