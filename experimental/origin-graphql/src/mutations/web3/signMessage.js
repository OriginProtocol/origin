import contracts from '../../contracts'

export default async (_, { address, message }) => {
  //TODO: get this right
  return await contracts.web3.eth.sign(message, address)
}
