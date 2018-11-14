import ContractService from '../../src/services/contract-service'
import V00_Marketplace from 'origin-contracts/build/contracts/V00_Marketplace.json'

/*
  Returns a contract service instance with a clean marketplace contract

  This creates a clean environment for testing without side effects.
*/

export default async function contractServiceHelper(web3) {
  const accounts = await web3.eth.getAccounts()
  const dummyContractService = new ContractService({ web3 })
  const owner = accounts[0]

  const originToken = await dummyContractService.deployed(
    dummyContractService.contracts['OriginToken']
  )

  // Deploy clean listings registry for testing without side effects
  const receipt = await dummyContractService.deploy(
    dummyContractService.contracts['V00_Marketplace'],
    [originToken.options.address],
    { from: owner, gas: 4000000 }
  )

  const v00_marketplace = new web3.eth.Contract(V00_Marketplace.abi, receipt.contractAddress)
  await v00_marketplace.methods.addAffiliate(
    accounts[3],
    '0x0000000000000000000000000000000000000000000000000000000000000000'
  ).send({ from: owner })

  const decimals = await dummyContractService.call(
    'OriginToken',
    'decimals'
  )

  // approve usage of tokens by marketplace contract
  for (let i = 0; i < 10; i++) {
    await dummyContractService.call(
      'OriginToken',
      'approve',
      [ receipt.contractAddress, String(100 * 10**decimals) ],
      { from: accounts[i] }
    )
  }

  await originToken.methods.addCallSpenderWhitelist(receipt.contractAddress).send({ from: accounts[0], gas: 4000000 })

  return new ContractService({
    web3,
    contractAddresses: {
      V00_Marketplace: {
        999: { address: receipt.contractAddress }
      }
    },
    currencies: { OGN: { address: originToken.options.address, decimals } }
  })
}
