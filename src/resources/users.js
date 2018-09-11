import V00_UsersAdapter from '../adapters/users/v00'
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
    this.adapters = {
      '000': new V00_UsersAdapter(...arguments)
    }
    this.versions = ['000']
    this.currentVersion = this.versions[this.versions.length - 1]
    this.currentAdapter = this.adapters[this.currentVersion]
  }

  async set({ profile, attestations = [] }) {
    if (profile) {
      validateUser(profile)
    }
    return this.currentAdapter.set({ profile, attestations })
  }

  async get(address) {
    return this.currentAdapter.get(address)
  }
}

module.exports = Users
