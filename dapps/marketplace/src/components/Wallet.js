import React from 'react'
import { fbt } from 'fbt-runtime'

import withWallet from 'hoc/withWallet'

import Identicon from 'components/Identicon'
import Balances from 'components/Balances'
import EthAddress from 'components/EthAddress'

const Wallet = ({ wallet }) => (
  <div className="wallet">
    <div className="wallet-info">
      <div>
        <h5>
          <fbt desc="Wallet.ethAddress">ETH Address</fbt>
        </h5>
        <EthAddress address={wallet} />
      </div>
      <div className="identicon">
        <Identicon size={50} address={wallet} />
      </div>
    </div>
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
