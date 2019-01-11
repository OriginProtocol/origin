import origin from '../services/origin'
const { web3 } = origin.contractService

export function toOgns(balance) {
  if (origin.token.decimals)
  {
    return balance ? Number(web3.utils.toBN(balance).div(web3.utils.toBN(10 ** origin.token.decimals))) : 0
  }
  else
  {
    return 0
  }
}
