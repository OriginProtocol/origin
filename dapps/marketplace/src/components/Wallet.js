import React from 'react'
import { Query } from 'react-apollo'
import { fbt } from 'fbt-runtime'

import ProfileQuery from 'queries/Profile'

import Identicon from 'components/Identicon'
import Balances from 'components/Balances'
import EthAddress from 'components/EthAddress'

const Wallet = () => (
  <Query query={ProfileQuery}>
    {({ data, loading, error }) => {
      if (loading || error) return null

      if (!data || !data.web3 || !data.web3.primaryAccount) {
        return null
      }
      const { checksumAddress, balance, id } = data.web3.primaryAccount
      return (
        <div className="wallet">
          <div className="wallet-info">
            <div>
              <h5>
                <fbt desc="Wallet.ethAddress">ETH Address</fbt>
              </h5>
              <EthAddress address={checksumAddress} />
            </div>
            <div className="identicon">
              <Identicon size={50} address={checksumAddress} />
            </div>
          </div>
          <Balances balance={balance} account={id} />
        </div>
      )
    }}
  </Query>
)

export default Wallet

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
