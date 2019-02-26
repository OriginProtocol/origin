export default async (_, { address, message }) => {

  //TODO: get this right
  const result = await window.web3.eth.sign(message, address)
  return result
}
