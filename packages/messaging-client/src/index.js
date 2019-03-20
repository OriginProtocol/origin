import ecies from 'eth-ecies'

import OriginMessaging from './Messaging'

export default function Messaging({
  messagingNamespace,
  web3,
  globalKeyServer,
  personalSign
}) {
  const instance = new OriginMessaging({
    contractService: { web3 },
    ecies,
    messagingNamespace,
    globalKeyServer,
    personalSign
  })

  if (typeof window !== undefined) {
    window.__setWalletMessaging = (messageAccount, messageKeys) => {
      window.__messagingAccount = { messageAccount, messageKeys }
    }
  }

  return instance
}
