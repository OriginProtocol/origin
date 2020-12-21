import React from 'react'

import OGNCoin from '@/assets/ogn-coin.svg'
import OUSDCoin from '@/assets/ousd-coin.svg'

const CoinsIcon = () => {
  return (
    <div className="coins-icon">
      <OUSDCoin className="ousd-coin" />
      <OGNCoin className="ogn-coin" />
    </div>
  )
}

export default CoinsIcon
