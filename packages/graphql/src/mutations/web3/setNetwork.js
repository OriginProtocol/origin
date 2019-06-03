import * as contracts from '../../contracts'

async function setNetwork(_, { network, customConfig }) {
  contracts.setNetwork(network, customConfig)
  return true
}

export default setNetwork
