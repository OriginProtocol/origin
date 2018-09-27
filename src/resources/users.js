import UsersResolver from '../contractInterface/users/resolver'

class Users {
  constructor({ contractService, ipfsService }) {
    this.resolver = new UsersResolver({ contractService, ipfsService })
  }

  /* possible options values: 
   * - confirmationCallback(confirmationCount, transactionReceipt) -> called repeatedly after a transaction is mined
   * - transactionHashCallback(hash) -> called immediately when the transaction hash is received
   */
  async set({ profile, attestations = [], options = {}}) {
    return this.resolver.set({ profile, attestations, options })
  }

  async get(address) {
    return this.resolver.get(address)
  }
}

module.exports = Users
