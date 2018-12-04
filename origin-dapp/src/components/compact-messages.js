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
    const { created, hash } = message
    const previousMessage = i === 0 ? {} : messages[i - 1]
    const timeElapsed = getElapsedTime(created, previousMessage.created)
    const showTime = timeElapsed >= MAX_MINUTES || i === 0

    return <Message seller={seller} key={hash} showTime={showTime} message={message} />
  })

export default CompactMessages
