import UserRegistry from 'origin-contracts/build/contracts/V00_UserRegistry'
import KeyHolderLibrary from 'origin-contracts/build/contracts/KeyHolderLibrary'
import ClaimHolderLibrary from 'origin-contracts/build/contracts/ClaimHolderLibrary'
import OriginIdentity from 'origin-contracts/build/contracts/OriginIdentity'

import txHelper, { checkMetaMask } from '../_txHelper'
import contracts from '../../contracts'

async function deployIdentityContract(_, { contract, from }) {
  const web3 = contracts.web3Exec
  await checkMetaMask(from)
  let ContractDef, data
  if (contract === 'KeyHolderLibrary') {
    ContractDef = KeyHolderLibrary
    data = KeyHolderLibrary.bytecode
  } else if (contract === 'ClaimHolderLibrary') {
    ContractDef = ClaimHolderLibrary
    data = ClaimHolderLibrary.bytecode
    if (!window.localStorage.KeyHolderLibrary) {
      throw 'Could not link KeyHolderLibrary'
    }
    data = data.replace(
      /__KeyHolderLibrary______________________/g,
      window.localStorage.KeyHolderLibrary.slice(2)
    )
  } else if (contract === 'OriginIdentity') {
    ContractDef = OriginIdentity
    data = OriginIdentity.bytecode
    if (!window.localStorage.KeyHolderLibrary) {
      throw 'Could not link KeyHolderLibrary'
    }
    if (!window.localStorage.ClaimHolderLibrary) {
      throw 'Could not link ClaimHolderLibrary'
    }
    data = data
      .replace(
        /__KeyHolderLibrary______________________/g,
        window.localStorage.KeyHolderLibrary.slice(2)
      )
      .replace(
        /__ClaimHolderLibrary____________________/g,
        window.localStorage.ClaimHolderLibrary.slice(2)
      )
  } else if (contract === 'UserRegistry') {
    ContractDef = UserRegistry
    data = UserRegistry.bytecode
  }
  if (!ContractDef) {
    throw 'Unknown Contract'
  }

  const Contract = new web3.eth.Contract(ContractDef.abi)
  const tx = Contract.deploy({ data }).send({ gas: 5500000, from })

  return txHelper({
    tx,
    from,
    mutation: 'deployIdentityContract',
    onReceipt: receipt => {
      Contract.options.address = receipt.contractAddress
      if (contract === 'UserRegistry') {
        contracts.userRegistry = Contract
        contracts.userRegistryExec = Contract
        window.localStorage.userRegistryContract = receipt.contractAddress
      } else {
        window.localStorage[contract] = receipt.contractAddress
      }
      if (contract === 'OriginIdentity') {
        contracts[contract] = Contract
        contracts[`${contract}Exec`] = Contract
      }
    }
  })
}

export default deployIdentityContract
