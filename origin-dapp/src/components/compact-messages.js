import React from 'react'
import Message from 'components/message'

const MAX_MINUTES = 10

function getElapsedTime(recentTime, previousTime) {
  const toMinutes = 1000 * 60
  const elapsedTime = (recentTime - previousTime) / toMinutes

  return isNaN(elapsedTime) ? 0 : elapsedTime
}

const CompactMessages = ({ messages = [], seller }) =>
  messages.map((message, i) => {
    const { senderAddress, created, hash } = message
    const previousMessage = i === 0 ? {} : messages[i - 1]
    const sameSender = senderAddress === previousMessage.senderAddress
    const timeElapsed = getElapsedTime(created, previousMessage.created)
    const contentOnly = sameSender && timeElapsed < MAX_MINUTES

    return <Message seller={seller} key={hash} contentOnly={contentOnly} message={message} />
  })

export default CompactMessages
