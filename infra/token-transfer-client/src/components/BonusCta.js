import React from 'react'
import moment from 'moment'

import BorderedCard from '@/components/BorderedCard'
import ClockIcon from '@/assets/clock-icon.svg'

const BonusCta = ({
  enabledUntil,
  fullWidth,
  lockupRate,
  nextVest,
  onDisplayBonusModal
}) => {
  const renderCountdown = () => {
    return (
      <>
        <ClockIcon
          className="icon-white"
          style={{ transform: 'scale(0.5)', marginTop: '-0.4rem' }}
        />
        <strong>30d 23h 12m</strong>
      </>
    )
  }

  return (
    <BorderedCard blue={true}>
      <div className={`row ${fullWidth ? 'align-items-center' : ''}`}>
        <div className={`${fullWidth ? 'col-lg-3 col-12' : 'col-8'}`}>
          <h1 className="mb-0">
            {moment(nextVest.date).format('MMMM YYYY')}
            <br />
            <strong>SPECIAL OFFER!</strong>
          </h1>
        </div>

        {!fullWidth && (
          <div className="col-4 text-right">{renderCountdown()}</div>
        )}

        <div className={`${fullWidth ? 'col-lg-6' : ''} col-12`}>
          <p className="mb-0">
            Earn <strong>{lockupRate}% bonus</strong> on your tokens that vest
            in {moment(nextVest.date).format('MMMM')}.
            <br />
            Offer valid until {enabledUntil}.{fullWidth && renderCountdown()}
          </p>
        </div>

        <div
          className={`${
            fullWidth ? 'col-lg-3 text-lg-right mt-3 mt-lg-0' : 'mt-5'
          } col-12`}
        >
          <button
            className="btn btn-lg btn-dark text-nowrap"
            onClick={onDisplayBonusModal}
          >
            Learn More
          </button>
        </div>
      </div>
    </BorderedCard>
  )
}

export default BonusCta
