// const contractService = require('./contract-service')
// const ipfsService = require('./ipfs-service')
// const originService = require('./origin-service')

import contractService from './contract-service'
import ipfsService from './ipfs-service'
import originService from './origin-service'
import userRegistryService from './origin-service'

module.exports = {
    contractService,
    ipfsService,
    originService,
    userRegistryService
}
