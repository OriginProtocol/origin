import UsersResolver from '../contractInterface/users/resolver'
import { IpfsDataStore } from '../ipfsInterface/store'

export default class Users {
  constructor(
    { contractService,
      ipfsService,
      blockEpoch,
      blockAttestattionV1,
      attestationAccount
    }) {
    this.ipfsDataStore = new IpfsDataStore(ipfsService)
    this.resolver = new UsersResolver({
      contractService,
      ipfsService,
      blockEpoch,
      blockAttestattionV1,
      attestationAccount })
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
  // TODO: document the type of attestation. Probably not an AttestationObject. Is it the data as returned by the bridge ?
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
