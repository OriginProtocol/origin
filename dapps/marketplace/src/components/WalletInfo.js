import React from 'react'

import Identicon from 'components/Identicon'

const WalletInfo = ({ title, wallet }) => (
  <div className="wallet-info">
    <div>
      <h5>{title}</h5>
      <div className="wallet-address">{wallet}</div>
    </div>
    <div className="identicon">
      <Identicon size={50} address={wallet} />
    </div>
  </div>
)

export default WalletInfo
