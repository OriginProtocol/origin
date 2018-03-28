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

var origin = {
    contractService: contractService,
    ipfsService: ipfsService,
    originService: originService,
    userRegistryService: userRegistryService
}

var resources = {
    listing: require('./resources/listing')
}

// Give each resource access to the origin services.
// By having a single origin, its configuration can be changed
// and all contracts will follow it
for(var resourceName in resources){
    resources[resourceName].origin = origin
}

origin.resources = resources

module.exports = origin