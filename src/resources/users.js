import UsersResolver from '../adapters/users/_resolver'
import ResourceBase from './_resource-base'
import userSchema from '../schemas/user.json'

const Ajv = require('ajv')
const ajv = new Ajv()

const validateUser = data => {
  const validate = ajv.compile(userSchema)
  if (!validate(data)) {
    throw new Error('Invalid user data')
  } else {
    return data
  }
}

class Users extends ResourceBase {
  constructor({ contractService, ipfsService }) {
    super({ contractService, ipfsService })
    this.resolver = new UsersResolver({ contractService, ipfsService })
  }

  async set({ profile, attestations = [] }) {
    if (profile) {
      validateUser(profile)
    }
    return this.resolver.set({ profile, attestations })
  }

  async get(address) {
    return this.resolver.get(address)
  }
}

module.exports = Users
