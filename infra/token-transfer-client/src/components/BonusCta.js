import React from 'react'

import BorderedCard from '@/components/BorderedCard'
import ClockIcon from '-!react-svg-loader!@/assets/clock-icon.svg'

const BonusCta = ({
  fullWidth,
  lockupRate,
  nextVestMonth,
  onDisplayBonusModal
}) => {
  const renderFullWidth = () => {
    return (
      <div className="row align-items-center">
        <div className="col">
          <h1 className="mb-1">
            Earn even more <strong>BONUS TOKENS!</strong>
          </h1>
          <p className="mb-0">
            For a limited time only, earn {lockupRate}% bonus tokens on your
            tokens that vest in {nextVestMonth}
          </p>
        </div>
        <div className="col text-center">
          <h5 className="mb-1">Offer expires in</h5>
          <h5 className="mb-0">
            <ClockIcon
              className="icon-white mx-2"
              style={{ transform: 'scale(0.8)' }}
            />
            <strong>30d 23h 12m</strong>
          </h5>
        </div>
        <div className="col text-center">
          <button className="btn btn-lg btn-dark" onClick={onDisplayBonusModal}>
            Learn More
          </button>
        </div>
      </div>
    )
  }

  const renderStandardWidth = () => {
    return <div></div>
  }

  return (
    <BorderedCard blue={true}>
      {fullWidth ? renderFullWidth() : renderStandardWidth()}
    </BorderedCard>
  )
}

export default BonusCta
