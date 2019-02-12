import contracts from '../../contracts'

export default async (_, { address, message }) => {
  return await contracts.web3.eth.sign(message, address)
}
