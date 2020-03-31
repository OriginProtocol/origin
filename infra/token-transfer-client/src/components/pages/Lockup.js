import React, { useEffect, useState } from 'react'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { bindActionCreators } from 'redux'
import moment from 'moment'
import BigNumber from 'bignumber.js'

import { fetchConfig } from '@/actions/config'
import {
  getConfig,
  getIsLoading as getConfigIsLoading
} from '@/reducers/config'
import { fetchGrants } from '@/actions/grant'
import {
  getGrants,
  getIsLoading as getGrantIsLoading,
  getTotals as getGrantTotals
} from '@/reducers/grant'
import { confirmLockup, fetchLockups } from '@/actions/lockup'
import {
  getLockups,
  getTotals as getLockupTotals,
  getIsLoading as getLockupIsLoading
} from '@/reducers/lockup'
import { fetchTransfers } from '@/actions/transfer'
import {
  getIsLoading as getTransferIsLoading,
  getWithdrawnAmount
} from '@/reducers/transfer'
import BonusModal from '@/components/BonusModal'
import LockupGraph from '@/components/LockupGraph'

const Lockup = props => {
  useEffect(() => {
    props.fetchConfig(),
      props.fetchGrants(),
      props.fetchLockups(),
      props.fetchTransfers()
  }, [])

  const [displayBonusModal, setDisplayBonusModal] = useState(false)
  if (
    props.accountIsLoading ||
    props.configIsLoading ||
    props.transferIsLoading ||
    props.grantIsLoading ||
    props.lockupIsLoading
  ) {
    return (
      <div className="spinner-grow" role="status">
        <span className="sr-only">Loading...</span>
      </div>
    )
  }

  const isLocked =
    !props.config.unlockDate || moment.utc() < props.config.unlockDate
  const { vestedTotal } = props.grantTotals
  const balanceAvailable = vestedTotal
    .minus(props.withdrawnAmount)
    .minus(props.lockupTotals.locked)

  const renderLockups = lockups => {
    const now = moment.utc()
    const sortedLockups = lockups.sort((a, b) => (a.date < b.date ? 1 : -1))

    const rows = sortedLockups.map(lockup => {
      return (
        <tr key={lockup.id}>
          <td>
            <div className="d-flex align-items-center">
              <div className="d-inline-block mr-4">
                <LockupGraph lockup={lockup} />
              </div>
              <strong>
                {Number(lockup.amount).toLocaleString()} OGN Lockup
              </strong>
            </div>
          </td>
          <td>{moment(lockup.createdAt).format('LL')}</td>
          <td>
            {moment(lockup.end).diff(now, 'days')}d{' '}
            {moment(lockup.end).diff(now, 'hours') % 24}h{' '}
            {moment(lockup.end).diff(now, 'minutes') % 60}m
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
        <tbody>{rows}</tbody>
      </table>
    )
  }

  return (
    <>
      {displayBonusModal && (
        <BonusModal
          balance={balanceAvailable}
          lockupBonusRate={props.config.lockupBonusRate}
          onModalClose={() => setDisplayBonusModal(false)}
        />
      )}

      <div className="row align-items-center">
        <div className="col-12 col-md-4">
          <h1 className="mb-2">Bonus Tokens</h1>
        </div>
        <div className="col-12 col-md-2">
          <small>
            <strong className="mr-2">Total Locked Up </strong>
            {Number(props.lockupTotals.locked).toLocaleString()} OGN
          </small>
        </div>
        <div className="col-12 col-md-2">
          <small>
            <strong className="mr-2">Total Earned </strong>
            {Number(props.lockupTotals.earnings).toLocaleString()} OGN
          </small>
        </div>
        {!isLocked && (
          <div className="col text-md-right">
            <button
              className="btn btn-lg btn-primary mt-4 mt-md-0"
              onClick={() => setDisplayBonusModal(true)}
            >
              Start Earning
            </button>
          </div>
        )}
      </div>
      <hr />
      <div className="row">
        <div className="col">
          {props.lockups && props.lockups.length > 0 ? (
            renderLockups(props.lockups)
          ) : (
            <div className="p-5 text-muted text-center">
              <div className="mb-3" style={{ fontSize: '28px' }}>
                You don&apos;t have any OGN locked up.
              </div>
              {isLocked && (
                <div style={{ fontSize: '18px' }}>
                  Tokens have not yet been unlocked. Check back soon!
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

const mapStateToProps = ({ config, grant, lockup, transfer, user }) => {
  return {
    config: getConfig(config),
    configIsLoading: getConfigIsLoading(config),
    grants: getGrants(grant),
    grantIsLoading: getGrantIsLoading(grant),
    grantTotals: getGrantTotals(user, grant),
    lockups: getLockups(lockup),
    lockupIsLoading: getLockupIsLoading(lockup),
    lockupTotals: getLockupTotals(lockup),
    transferIsLoading: getTransferIsLoading(transfer),
    withdrawnAmount: getWithdrawnAmount(transfer)
  }
}

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      confirmLockup: confirmLockup,
      fetchConfig: fetchConfig,
      fetchGrants: fetchGrants,
      fetchLockups: fetchLockups,
      fetchTransfers: fetchTransfers
    },
    dispatch
  )

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Lockup))
