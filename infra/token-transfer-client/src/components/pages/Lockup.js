import React, { useContext, useState } from 'react'
import { withRouter } from 'react-router-dom'
import moment from 'moment'
import BigNumber from 'bignumber.js'

import { DataContext } from '@/providers/data'
import StakeModal from '@/components/StakeModal'
import LockupGraph from '@/components/LockupGraph'

const Lockup = () => {
  const data = useContext(DataContext)

  const [displayStakeModal, setDisplayStakeModal] = useState(false)

  const renderLockups = lockups => {
    const now = moment.utc()
    const sortedLockups = lockups.sort((a, b) => (a.start < b.start ? 1 : -1))

    const rows = sortedLockups
      .filter(l => l.confirmed)
      .map(lockup => {
        return (
          <tr key={lockup.id}>
            <td>
              <div className="d-flex align-items-center">
                <div className="d-inline-block mr-4">
                  <LockupGraph lockup={lockup} />
                </div>
                {lockup.data && lockup.data.vest ? (
                  <strong>
                    {moment.utc(lockup.data.vest.date).format('MMMM YYYY')}{' '}
                    special offer lockup
                  </strong>
                ) : (
                  <strong>
                    {Number(lockup.amount).toLocaleString()} OGN Lockup
                  </strong>
                )}
              </div>
            </td>
            <td>{moment.utc(lockup.start).format('LL')}</td>
            <td>
              {moment.utc(lockup.end) < now ? (
                'Unlocked'
              ) : (
                <>
                  {moment.utc(lockup.end).diff(now, 'days')}d{' '}
                  {moment.utc(lockup.end).diff(now, 'hours') % 24}h{' '}
                  {moment.utc(lockup.end).diff(now, 'minutes') % 60}m
                </>
              )}
            </td>
            <td>
              <div
                className="status-circle bg-blue"
                style={{ marginLeft: '-1.5rem', marginRight: '0.5rem' }}
              ></div>{' '}
              {Number(lockup.amount).toLocaleString()}{' '}
              <span className="ogn">OGN</span>
            </td>
            <td>
              <div
                className="status-circle bg-purple"
                style={{ marginLeft: '-1.5rem', marginRight: '0.5rem' }}
              ></div>{' '}
              {Number(
                BigNumber((lockup.amount * lockup.bonusRate) / 100).toFixed(
                  0,
                  BigNumber.ROUND_HALF_UP
                )
              ).toLocaleString()}{' '}
              <span className="ogn">OGN</span>
            </td>
            <td>{lockup.bonusRate}%</td>
          </tr>
        )
      })
    return (
      <div className="table-responsive">
        <table className="table table-borderless table-card-rows">
          <thead>
            <tr>
              <th>Lock up name</th>
              <th>Created</th>
              <th>Unlocks</th>
              <th>Lock up amount</th>
              <th>Bonus tokens</th>
              <th>Yield %</th>
            </tr>
          </thead>
          <tbody>
            {data.lockups.length === 0 ? (
              <tr>
                <td className="table-empty-cell" colSpan="100%">
                  {data.config.isLocked
                    ? 'Tokens have not been ulocked yet'
                    : 'You do not have any lockups'}
                </td>
              </tr>
            ) : (
              rows
            )}
          </tbody>
        </table>
      </div>
    )
  }

  return (
    <>
      {displayStakeModal && (
        <StakeModal onModalClose={() => setDisplayStakeModal(false)} />
      )}

      <div className="row align-items-center">
        <div className="col-12 col-md-4">
          <h1 className="mb-2">Bonus Tokens</h1>
        </div>
        <div className="col-12 col-md-2">
          <small>
            <strong className="mr-2">Total Locked Up </strong>
            {Number(
              data.totals.locked.plus(data.totals.nextVestLocked)
            ).toLocaleString()}{' '}
            OGN
          </small>
        </div>
        <div className="col-12 col-md-2">
          <small>
            <strong className="mr-2">Total Earned </strong>
            {Number(data.totals.allEarnings.toLocaleString())} OGN
          </small>
        </div>
        {!data.config.isLocked && (
          <div className="col text-md-right">
            <button
              className="btn btn-lg btn-primary mt-4 mt-md-0"
              onClick={() => setDisplayStakeModal(true)}
              disabled={!data.config.lockupsEnabled}
            >
              Earn OGN
            </button>
          </div>
        )}
      </div>
      <hr />
      <div className="row">
        <div className="col">{renderLockups(data.lockups)}</div>
      </div>
    </>
  )
}

export default withRouter(Lockup)
