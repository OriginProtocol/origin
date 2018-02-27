// import contractService from './contract-service'
// import ipfsService from './ipfs-service'
// import originService from './origin-service'

const contractService = require('./contract-service')
const ipfsService = require('./ipfs-service')
const originService = require('./origin-service')

// module.exports.ContractService = ContractService
// module.exports.IpfsService = IpfsService
// module.exports.OriginService = OriginService

// module.exports = { ContractService
//           , IpfsService
//           , OriginService
//         }

// const contractService = 5
// const ipfsService = 4
// const originService = 3

module.exports = { contractService
                 , ipfsService
                 , originService
                 }
