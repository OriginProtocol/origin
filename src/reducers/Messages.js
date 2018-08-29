import { MessageConstants } from 'actions/Message'

export default function Messages(state = [], action = {}) {
  switch (action.type) {
  case MessageConstants.ADD:
    const {
      content,
      created,
      hash,
      index,
      listingAddress,
      purchaseAddress,
      recipients,
      roomId,
      senderAddress,
      status
    } = action.obj

    // prevent addition of duplicate messages
    if (state.find(m => m.hash === hash)) {
      return state
    }

    return [
      ...state,
      {
        conversationId: roomId,
        purchaseAddress,
        listingAddress,
        senderAddress,
        recipients,
        content,
        created,
        status,
        index,
        hash
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
