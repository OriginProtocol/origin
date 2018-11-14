import txHelper, { checkMetaMask } from '../_txHelper'
import contracts from '../../contracts'

async function updateTokenAllowance(_, { token, from, to, value }) {
  if (!contracts[token]) {
    return
  }
  await checkMetaMask(from)
  value = web3.utils.toWei(value, 'ether')
  const tx = contracts[token].methods.approve(to, value).send({
    gas: 4612388,
    from
  })
  return txHelper({ tx, mutation: 'transferToken' })
}

export default updateTokenAllowance

/*
mutation updateTokenAllowance($token: String!, $from: String!, $to: String!, $value: String!) {
  updateTokenAllowance(token: $token, from: $from, to: $to, value: $value)
}
{
  "token": "ogn",
  "from": "0x0CdaA819eB0BC9649591eeB1D7B0b4255C06EFD2",
  "to": "0xD7ebe7707b5160DD211F4206ffca1f3169f2E376",
  "value": "1"
}
*/
