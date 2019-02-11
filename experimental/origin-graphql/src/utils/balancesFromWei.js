import contracts from '../contracts'
export default function balancesFromWei(wei) {
  const eth = contracts.web3.utils.fromWei(wei, 'ether').substr(0, 7)
  return { wei, eth }
}
