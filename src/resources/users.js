import UsersResolver from '../ethereumInterface/users/_resolver'
import ResourceBase from './_resource-base'

class Users extends ResourceBase {
  constructor({ contractService, ipfsService }) {
    super({ contractService, ipfsService })
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
