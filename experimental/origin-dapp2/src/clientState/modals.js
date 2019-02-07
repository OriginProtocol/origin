export default {
  resolvers: {
    Mutation: {
      setOpenModal: (_, { modalName }, { cache }) => {
        const data = {
          modal: {
            __typename: 'ModalData',
            openedModal: modalName
          }
        }
        cache.writeData({ data })
        return null
      }
    }
  },
  defaults: {
    modal: {
      __typename: 'ModalData',
      openedModal: null
    }
  }
}
