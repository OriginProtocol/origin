import { MessageConstants } from '../actions/Message'

export default function Messages(state = [], action = {}) {
  switch (action.type) {

    case MessageConstants.ERROR:
      return state

    case MessageConstants.ADD:
      const { content, created, hash, index, recipients, roomId, senderAddress } = action.obj

      // prevent addition of duplicate messages
      if (state.find(m => m.hash === hash)) {
        return state
      }

      return [...state, {
        dialogueId: roomId,
        readAt: undefined,
        senderAddress,
        recipients,
        content,
        created,
        index,
        hash,
      }]

    default:
      return state
  }
}
