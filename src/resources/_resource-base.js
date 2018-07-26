class ResourceBase {
  constructor({ contractService, ipfsService }) {
    this.contractService = contractService
    this.ipfsService = ipfsService
  }
}

export default ResourceBase
