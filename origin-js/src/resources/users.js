import UsersResolver from '../contractInterface/users/resolver'

export default class Users {
  constructor({ contractService, ipfsService, blockEpoch, blockAttestattionV1 }) {
    this.resolver = new UsersResolver({ contractService, ipfsService, blockEpoch, blockAttestattionV1 })
  }

  /**
   * Creates or updates an identity.
   * @param profile
   * @param attestations
   * @param {Object} options
   *   confirmationCallback(confirmationCount, transactionReceipt) -> called repeatedly after a transaction is mined
   *   transactionHashCallback(hash) -> called immediately when the transaction hash is received
   * @return {Promise<txReceipt>}
   */
  async set({ profile, attestations = [], options = {} }) {
    return this.resolver.set({ profile, attestations, options })
  }

  /**
   * Loads an identity.
   * @param {string} address - Wallet address of the user.
   * @return {Promise<User>}
   */
  async get(address) {
    return this.resolver.get(address)
  }
}
