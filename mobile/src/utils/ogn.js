'use strict'

import Web3 from 'web3'

const web3 = new Web3()
const DECIMALS = 100000000000

export function toOgns(balance) {
  if (decimals) {
    return balance ? Number(web3.utils.toBN(balance).div(web3.utils.toBN(10 ** decimals))) : 0
  } else {
    return 0
  }
}
