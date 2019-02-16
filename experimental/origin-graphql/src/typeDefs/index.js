import Common from './Common'
import Web3 from './Web3'
import Marketplace from './Marketplace'
import Identity from './Identity'
import Attestations from './Attestations'
import Messaging from './Messaging'
import Notifications from './Notifications'
import WalletLinker from './WalletLinker'

export default [
  ...Object.values(Common),
  Web3,
  Marketplace,
  Identity,
  Messaging,
  Notifications,
  Attestations,
  WalletLinker
]
