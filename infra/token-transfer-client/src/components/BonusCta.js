import React from 'react'
import moment from 'moment'

import BorderedCard from '@/components/BorderedCard'
import ClockIcon from '@/assets/clock-icon.svg'

const BonusCta = ({
  earlyLockupsEnabledUntil,
  fullWidth,
  lockupRate,
  nextVest,
  onDisplayBonusModal
}) => {
  const renderCountdown = () => {
    const now = moment()
    return (
      <>
        <ClockIcon
          className="icon-white"
          style={{ transform: 'scale(0.5)', marginTop: '-0.4rem' }}
        />
        <strong>
          {moment(earlyLockupsEnabledUntil).diff(now, 'days')}d{' '}
          {moment(earlyLockupsEnabledUntil).diff(now, 'hours') % 24}h{' '}
          {moment(earlyLockupsEnabledUntil).diff(now, 'minutes') % 60}m
        </strong>
      </>
    )
  }

  return (
    <BorderedCard className="blue">
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
            Offer valid until{' '}
            {moment.utc(earlyLockupsEnabledUntil).format('DD MMMM')}.
            {fullWidth && renderCountdown()}
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
