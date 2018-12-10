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

function PurchaseMessage({ purchaseEvents, messageCreated, previousMessage }) {
  const updatedInfo = purchaseEvents.filter((info) => ((info !== undefined) && (info !== 0)))
  const displayInfo = (info) => {
    const noInfo = !info || info === 0
    if (noInfo) return
    if ((info.timestamp < messageCreated) && info.timestamp > (previousMessage.created/1000)) {
      return <div key={messageCreated + Math.random()}>Something should go here</div>
    }
    return null
  }
  return updatedInfo.map(displayInfo)
}

export default class CompactMessages extends Component {
  render() {
    const { messages = [], purchase, purchaseEvents } = this.props

    return messages.map((message, i) => {
      const { created, hash } = message
      const previousMessage = i === 0 ? {} : messages[i - 1]
      const timeElapsed = getElapsedTime(created, previousMessage.created)
      const showTime = timeElapsed >= MAX_MINUTES || i === 0

      return (
        <div key={hash+Math.random()}>
          <PurchaseMessage key={new Date() + Math.random()} messageCreated={(created/1000)} purchaseEvents={purchaseEvents} previousMessage={previousMessage} />
          <Message key={hash} showTime={showTime} message={message} />
        </div>
      )
    })
  }
}
