import { MessageConstants } from 'actions/Message'

export default function Messages(state = [], action = {}) {
  switch (action.type) {
  case MessageConstants.ADD:
    const {
      content,
      created,
      decryption,
      hash,
      index,
      listingId,
      purchaseId,
      recipients,
      roomId,
      senderAddress,
      status,
      acceptance
    } = action.obj

    // prevent addition of duplicate messages
    if (state.find(m => m.hash === hash)) {
      return state
    }

    return [
      ...state,
      {
        conversationId: roomId,
        senderAddress,
        decryption,
        purchaseId,
        recipients,
        listingId,
        content,
        created,
        status,
        index,
        hash,
        acceptance
      }
    ]

  case MessageConstants.ERROR:
    return state

  case MessageConstants.UPDATE:
    return state.map(m => {
      return m.hash === action.obj.hash ? action.obj : m
    })

  default:
    return state
  }
}
