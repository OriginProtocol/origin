import V00_UsersAdapter from './v00_adapter'
import V01_UsersAdapter from './v01_adapter'
import UserObject from '../../models/user'

export default class UsersResolver {
  constructor({ contractService, ipfsService, blockEpoch, blockAttestattionV1, attestationAccount }) {
    this.adapters = {
      '000': new V00_UsersAdapter({ contractService, ipfsService, blockEpoch, blockAttestattionV1 }),
      '001': new V01_UsersAdapter({ contractService, ipfsService, blockEpoch, attestationAccount })
    }
    this.versions = ['000', '001']
    this.currentVersion = this.versions[this.versions.length - 1]
    this.currentAdapter = this.adapters[this.currentVersion]
  }

  /**
   * Creates or updates an identity for the current account.
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
   * @param {string} address - User's wallet address.
   * @return {Promise<User>} User model object.
   */
  async get(address) {
    let result = false
    let version = null
    for (let i = this.versions.length - 1; i >= 0 && !result; i--) {
        version = this.versions[i]
        result = await this.adapters[version].get(address)
    }
    if (result) {
      return new UserObject({ ...result, version })
    } else {
      return new UserObject({ address, version: null })
    }
  }

  /**
   * Origin-mobile specific. Hack to update the config after the UsersResolver
   * object has already been created.
   */
  updateConfig({ attestationAccount }) {
    this.adapters['001'].issuerAddress = attestationAccount
  }
}
