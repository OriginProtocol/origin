import React, { useContext, useState } from 'react'
import { Link } from 'react-router-dom'

import Dropdown from 'react-bootstrap/Dropdown'
import BorderedCard from '@/components/BorderedCard'

import CoinsImage from '@/assets/coins-image.svg'

const StakeBanner = ({ fullWidth }) => {
  return (
    <>
      <BorderedCard className={`d-flex stake${fullWidth ? ' stake-banner align-items-center' : ' blue stake-card justify-content-between'}`}>
        {/* <CoinsImage className="coins-image" /> */}
        <div className="content">
          <h1>Stake OGN on OUSD.com</h1>
          <p>As part of the Origin Dollar governance project, OGN staking has moved to OUSD.com</p>
        </div>
        <a
          className={`btn btn-lg btn-dark text-nowrap`}
          href='http://google.com'
        >
          Earn OGN
          </a>
      </BorderedCard>
    </>
  )
}

export default StakeBanner
