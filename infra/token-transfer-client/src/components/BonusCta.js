import React, { useContext } from 'react'
import moment from 'moment'

import { DataContext } from '@/providers/data'
import BorderedCard from '@/components/BorderedCard'
import ClockIcon from '@/assets/clock-icon.svg'

const BonusCta = ({
  fullWidth,
  nextVest,
  lockupBonusRate,
  onDisplayBonusModal
}) => {
  const data = useContext(DataContext)

  const renderCountdown = () => {
    const now = moment()
    return (
      <>
        <ClockIcon
          className="icon-white"
          style={{ transform: 'scale(0.5)', marginTop: '-0.4rem' }}
        />
        <strong>
          {moment.utc(data.config.earlyLockupsEnabledUntil).diff(now, 'days')}d{' '}
          {moment.utc(data.config.earlyLockupsEnabledUntil).diff(now, 'hours') %
            24}
          h{' '}
          {moment
            .utc(data.config.earlyLockupsEnabledUntil)
            .diff(now, 'minutes') % 60}
          m
        </strong>
      </>
    )
  }

  return (
    <BorderedCard
      className="blue"
      onClick={onDisplayBonusModal}
      style={{ cursor: 'pointer' }}
    >
      <div className={`row ${fullWidth ? 'align-items-center' : ''}`}>
        <div className={`${fullWidth ? 'col-lg-3 col-12' : 'col-8'}`}>
          <h1 className="mb-0">
            {moment.utc(nextVest.date).format('YYYY MMMM')}
            <br />
            <strong>SPECIAL OFFER!</strong>
          </h1>
        </div>

        {!fullWidth && (
          <div className="col-4 text-right">{renderCountdown()}</div>
        )}

        <div className={`${fullWidth ? 'col-lg-6' : ''} col-12`}>
          <p className="mb-0">
            Earn <strong>{lockupBonusRate}% bonus</strong> on your tokens that
            vest in {moment.utc(nextVest.date).format('MMMM')}.
            <br />
            Offer valid until{' '}
            {moment.utc(data.config.earlyLockupsEnabledUntil).format('DD MMMM')}
            .{fullWidth && renderCountdown()}
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
