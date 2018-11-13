import UsersResolver from '../contractInterface/users/resolver'

export default class Users {
  constructor({ contractService, ipfsService, blockEpoch, blockAttestattionV1 }) {
    this.resolver = new UsersResolver({ contractService, ipfsService, blockEpoch, blockAttestattionV1 })
  }

  /* possible options values:
   * - confirmationCallback(confirmationCount, transactionReceipt) -> called repeatedly after a transaction is mined
   * - transactionHashCallback(hash) -> called immediately when the transaction hash is received
   */
  async set({ profile, attestations = [], options = {} }) {
    return this.resolver.set({ profile, attestations, options })
  }

  async get(address) {
    return this.resolver.get(address)
  }
}
