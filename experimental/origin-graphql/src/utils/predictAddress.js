import { encode as rlpEncode } from 'rlp'

export default async function predictAddress(web3, wallet) {
  const nonce = await web3.eth.getTransactionCount(wallet)
  const encoded = rlpEncode([wallet, nonce])
  const address = '0x' + web3.utils.sha3(encoded).substring(26, 66)
  return web3.utils.toChecksumAddress(address)
}
