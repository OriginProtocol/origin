import React from 'react'
import BorderedCard from '@/components/BorderedCard'
import CoinsIcon from '@/components/CoinsIcon'

const STAKE_URL = process.env.STAKE_URL || 'https://ousd.com/stake'

const StakeBanner = ({ fullWidth }) => {
  return (
    <>
      <BorderedCard
        className={`d-flex stake${
          fullWidth
            ? ' stake-banner align-items-center'
            : ' justify-content-between blue stake-card'
        }`}
      >
        {fullWidth && <CoinsIcon />}
        <div className="content">
          <h1>Stake OGN on OUSD.com</h1>
          <p>
            As part of the Origin Dollar governance project, OGN staking has
            moved to OUSD.com
          </p>
        </div>
        <a
          className={`btn btn-lg btn-dark text-nowrap ml-md-auto`}
          href={STAKE_URL}
          target="_blank"
        >
          Earn OGN
        </a>
      </BorderedCard>
    </>
  )
}

export default StakeBanner
