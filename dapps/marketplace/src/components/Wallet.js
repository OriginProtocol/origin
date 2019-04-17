import React from 'react'
import { fbt } from 'fbt-runtime'

import withWallet from 'hoc/withWallet'

import Balances from 'components/Balances'
import WalletInfo from 'components/WalletInfo'

const Wallet = ({ wallet, walletProxyOwner }) => (
  <div className="wallet">
    {walletProxyOwner ? (
      <>
        <WalletInfo
          title={fbt('Identity Contract', 'Wallet.identityContract')}
          wallet={wallet}
        />
        <WalletInfo
          title={fbt('Identity Owner', 'Wallet.identityOwner')}
          wallet={walletProxyOwner}
        />
      </>
    ) : (
      <WalletInfo
        title={fbt('ETH Address', 'Wallet.ethAddress')}
        wallet={wallet}
      />
    )}

    <Balances account={wallet} />
  </div>
)

export default withWallet(Wallet)

require('react-styl')(`
  .wallet
    color: var(--white);
    background-color: var(--dark);
    margin-bottom: 2rem;
    border-radius: var(--default-radius);
    word-break: break-all;
    font-size: 14px;
    .wallet-info
      padding: 1rem 1.5rem
      display: flex
      flex-direction: row
      font-size: 14px
      border-bottom: 2px solid black
      padding-bottom: 1rem
      font-weight: normal
      a
        color: var(--white)
      .identicon
        margin-left: 0.5rem
        display: flex
        align-items: center
    h5
      font-size: 14px
      color: var(--light)
    .balances
      padding: 1rem 1.5rem

`)
