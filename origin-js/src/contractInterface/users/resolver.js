import V00_UsersAdapter from './v00_adapter'
import V01_UsersAdapter from './v00_adapter'
import UserObject from '../../models/user'

export default class UsersResolver {
  constructor({ contractService, ipfsService, blockEpoch, blockAttestattionV1 }) {
    this.adapters = {
      '000': new V00_UsersAdapter({ contractService, ipfsService, blockEpoch, blockAttestattionV1 }),
      '001': new V01_UsersAdapter({ contractService, ipfsService, blockEpoch })
    }
    this.versions = ['000', '001']
    this.currentVersion = this.versions[this.versions.length - 1]
    this.currentAdapter = this.adapters[this.currentVersion]
  }

  /**
   * Creates or updates an identity.
   * @param profile
   * @param attestations
   * @param options
   * @return {Promise<*>}
   */
  async set({ profile, attestations = [], options = {} }) {
    return this.currentAdapter.set({ profile, attestations, options })
  }

  /**
   * Loads an identity.
   * @param address User's wallet address.
   * @return {Promise<User>} User model object.
   */
  async get(address) {
    let result = false
    for (let i = this.versions.length - 1; i >= 0; i--) {
      if (!result) {
        const version = this.versions[i]
        result = await this.adapters[version].get(address)
      }
    }
    if (result) {
      return new UserObject(result)
    } else {
      return new UserObject({ address })
    }
  }

  /**
   * Returns the user's identity address.
   *  - In V00 identity was stored in a separate contract.
   *  - In V01 identity is stored off-chain and identity address === wallet address.
   * @param wallet
   * @return {Promise<boolean>}
   */
  async identityAddress(wallet) {
    let result = false
    for (let i = this.versions.length - 1; i >= 0; i--) {
      if (!result) {
        const version = this.versions[i]
        result = await this.adapters[version].identityAddress(wallet)
      }
    }
    return result
  }
}
