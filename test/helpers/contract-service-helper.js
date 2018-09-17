import ContractService from '../../src/services/contract-service'
import Web3 from 'web3'

/*
  Returns a contract service instance with a clean marketplace contract

  This creates a clean environment for testing without side effects.
*/

export default async function contractServiceHelper(web3) {
  const accounts = await web3.eth.getAccounts()
  const dummyContractService = new ContractService({ web3 })

  const originToken = await dummyContractService.deployed(
    dummyContractService.contracts['OriginToken']
  )

  // Deploy clean listings registry for testing without side effects
  const v00_marketplace = await dummyContractService.deploy(
    dummyContractService.contracts['V00_Marketplace'],
    [originToken.options.address],
    { from: accounts[0], gas: 4000000 }
  )

  const v01_marketplace = await dummyContractService.deploy(
    dummyContractService.contracts['V01_Marketplace'],
    [originToken.options.address],
    { from: accounts[0], gas: 4000000 }
  )

  await originToken.methods.addCallSpenderWhitelist(v01_marketplace.contractAddress).send({ from: accounts[0], gas: 4000000 })

  return new ContractService({
    web3,
    contractAddresses: {
      V00_Marketplace: {
        999: { address: v00_marketplace.contractAddress }
      },
      V01_Marketplace: {
        999: { address: v01_marketplace.contractAddress }
      }
    }
  })
}
