import V00_UsersAdapter from './v00'

class UsersResolver {
  constructor({ contractService, ipfsService }) {
    this.adapters = {
      '000': new V00_UsersAdapter(...arguments)
    }
    this.versions = ['000']
    this.currentVersion = this.versions[this.versions.length - 1]
    this.currentAdapter = this.adapters[this.currentVersion]
  }

  async set({ profile, attestations = [] }) {
    return this.currentAdapter.set({ profile, attestations })
  }

  async get(address) {
    return this.currentAdapter.get(address)
  }

  async identityAddress(wallet) {
    return this.currentAdapter.identityAddress(wallet)
  }
}

module.exports = UsersResolver
