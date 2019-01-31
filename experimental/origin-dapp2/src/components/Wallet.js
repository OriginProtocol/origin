import React from 'react'
import { Query } from 'react-apollo'

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
            <div className="identicon">
              <Identicon size={50} address={checksumAddress} />
            </div>
            <div>
              <h5>ETH Address</h5>
              <EthAddress address={checksumAddress} />
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
    padding: 1rem;
    border-radius: 5px;
    word-break: break-all;
    font-size: 14px;
    .wallet-info
      display: flex
      flex-direction: row
      font-size: 14px
      .identicon
        margin-right: 0.5rem
        display: flex
        align-items: center
    h5
      font-size: 14px
    .balances
      border-top: 1px solid var(--steel)
      margin-top: 1rem;
      padding-top: 1rem;

`)
