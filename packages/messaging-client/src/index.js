import ecies from 'eth-ecies'

import OriginMessaging from './Messaging'

export default function Messaging({
  messagingNamespace,
  web3,
  globalKeyServer,
  personalSign,
  pubsub
}) {
  return new OriginMessaging({
    contractService: { web3 },
    ecies,
    messagingNamespace,
    globalKeyServer,
    personalSign,
    pubsub
  })
}
