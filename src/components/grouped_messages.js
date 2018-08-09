import React from 'react'
import Message from 'components/message'

const MAX_MINUTES = 10

function getElapsedTime(recentTime, previousTime) {
  const toMinutes = 1000*60
  const elapsedTime = (recentTime - previousTime) / toMinutes

  return isNaN(elapsedTime) ? 0 : elapsedTime
}

const GroupedMessages = ({ messages=[] }) => (
  messages.map((message, i) => {
    const { senderAddress, created, hash, content } = message;
    const previousMessage = i == 0 ? {} : messages[i-1]
    const differentSender = senderAddress !== previousMessage.senderAddress
    const timeElapsed = getElapsedTime(created, previousMessage.created)

    if ((timeElapsed >= MAX_MINUTES) || differentSender) {
      return <Message key={hash} message={message} />
    }
    return (
      <div className="d-flex" key={hash}>
        <div className="pl-4 ml-5">
          {content}
        </div>
      </div>
    )
  })
)

export default GroupedMessages
