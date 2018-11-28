import contracts from '../contracts'

export default {
  messages: conversation =>
    new Promise(async (resolve) => {
      const messages = await contracts.messaging.getAllMessages(conversation.id)
      resolve(messages.map(m => ({
        ...m,
        msg: {
          ...m.msg,
          created: String(m.msg.created)
        }
      })))
    })
}
