import { toggleMetaMask } from '../../contracts'

export default function(_, { enabled }) {
  toggleMetaMask(enabled)
  return true
}
