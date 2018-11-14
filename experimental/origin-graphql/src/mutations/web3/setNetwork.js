import * as contracts from '../../contracts'

async function setNetwork(_, { network }) {
  contracts.setNetwork(network)
  return true
}

export default setNetwork
