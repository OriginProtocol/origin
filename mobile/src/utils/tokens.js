import originWallet from '../OriginWallet'
import origin from '../services/origin'

const { web3 } = origin.contractService

function toNum(balance, decimals) {
  return Number(web3.utils.toBN(balance).div(web3.utils.toBN(10 ** decimals)))
}

export function toDais(balance) {
  const decimals = originWallet.getDaiDecimals()

  if (decimals)
  {
    return balance ? toNum(balance, decimals) : 0
  }
  else
  {
    return 0
  }
}

export function toOgns(balance) {
  if (origin.token.decimals)
  {
    return balance ? toNum(balance, origin.token.decimals) : 0
  }
  else
  {
    return 0
  }
}
