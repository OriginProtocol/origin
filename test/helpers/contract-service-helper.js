import ListingsRegistryContract from '../../contracts/build/contracts/ListingsRegistry.json'
import ListingsRegistryStorageContract from '../../contracts/build/contracts/ListingsRegistryStorage.json'
import ContractService from '../../src/services/contract-service'
import Web3 from 'web3'

/*
  Returns a contract service instance with a clean listings registry

  This creates a clean environment for testing without side effects.
*/

export default async function contractServiceHelper(web3) {
  const accounts = await web3.eth.getAccounts()
  const dummyContractService = new ContractService({ web3 })

  // Deploy clean listings registry for testing without side effects
  const listingsRegistryStorage = await dummyContractService.deploy(
    ListingsRegistryStorageContract,
    [],
    { from: accounts[0], gas: 4000000 }
  )
  const listingsRegistry = await dummyContractService.deploy(
    ListingsRegistryContract,
    [ listingsRegistryStorage.contractAddress ],
    { from: accounts[0], gas: 4000000 }
  )
  await dummyContractService.contractFn(
    dummyContractService.listingsRegistryStorageContract,
    listingsRegistryStorage.contractAddress,
    'setActiveRegistry',
    [ listingsRegistry.contractAddress ],
    { from: accounts[0], gas: 4000000 }
  )

  return new ContractService({
    web3,
    contractAddresses: {
      listingsRegistryContract: {
        999: { address: listingsRegistry.contractAddress }
      }
    }
  })
}
