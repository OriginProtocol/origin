// const contractService = require('./contract-service')
// const ipfsService = require('./ipfs-service')
// const originService = require('./origin-service')

import ContractService from './contract-service'
import IpfsService from './ipfs-service'
import OriginService from './origin-service'
import UserRegistryService from './user-registry-service'

const contractService = new ContractService()
const ipfsService = new IpfsService()
const originService = new OriginService({ contractService, ipfsService })
const userRegistryService = new UserRegistryService()

module.exports = {
    contractService,
    ipfsService,
    originService,
    userRegistryService
}
