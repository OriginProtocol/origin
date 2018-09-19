import UsersResolver from '../ethereumInterface/users/resolver'

class Users {
  constructor({ contractService, ipfsService }) {
    this.resolver = new UsersResolver({ contractService, ipfsService })
  }

  async set({ profile, attestations = [] }) {
    return this.resolver.set({ profile, attestations })
  }

  async get(address) {
    return this.resolver.get(address)
  }
}

module.exports = Users
