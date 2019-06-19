import React from 'react'
import { fbt } from 'fbt-runtime'

const WalletHeader = () => (
  <>
    <h1 className="mb-1">
      <fbt desc="onboard.Wallet.connectCryptoWallet">
        Connect a Crypto Wallet
      </fbt>
    </h1>
    <p className="description mb-5">
      <fbt desc="onboard.Wallet.needWalletToTransact">
        In order to successfully transact with others on our DApp, you’ll need a
        wallet to store cryptocurrency.
      </fbt>
    </p>
  </>
)

export default WalletHeader
