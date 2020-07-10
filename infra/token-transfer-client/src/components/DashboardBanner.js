import React from 'react'

import Arrow from '@/assets/arrow.svg'
import ChartIcon from '@/assets/chart-icon.svg'

const DashboardBanner = () => {
  return (
    <div className="dashboard-banner">
      <div className="row">
        <div className="col-1 d-none d-md-block">
          <ChartIcon className="chart-icon mx-3" />
        </div>
        <div className="col-11 col-lg-9">
          Check out the latest OGN token metrics
          <Arrow className="arrow mx-2" />
          <b>300+</b> investors have locked up <b>20m+</b> tokens
        </div>
        <div className="col-11 offset-md-1 col-lg-2 offset-lg-0 text-lg-right text-nowrap">
          <a
            href="https://originprotocol.com/dashboard"
            target="blank"
            rel="noopener noreferrer"
          >
            Visit OGN Dashboard &rsaquo;
          </a>
        </div>
      </div>
    </div>
  )
}

export default DashboardBanner
