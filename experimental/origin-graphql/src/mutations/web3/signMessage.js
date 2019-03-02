import contracts from '../../contracts'

export default async (_, { address, message }) => {
  return await contracts.web3Exec.eth.personal.sign(message, address)
}
