import React, { useEffect, useState } from 'react'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { bindActionCreators } from 'redux'
import moment from 'moment'

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
import { getUnlockDate } from '@/utils'
import LockupCard from '@/components/LockupCard'
import BonusModal from '@/components/BonusModal'

const Lockup = props => {
  useEffect(() => {
    props.fetchGrants(), props.fetchLockups(), props.fetchTransfers()
  }, [])

  const [displayBonusModal, setDisplayBonusModal] = useState(false)
  if (
    props.accountIsLoading ||
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

  const unlockDate = getUnlockDate(props.user)
  const isLocked = moment.utc() < unlockDate
  const { vestedTotal } = props.grantTotals
  const balanceAvailable = vestedTotal
    .minus(props.withdrawnAmount)
    .minus(props.lockupTotals.locked)

  const renderLockups = lockups => {
    return lockups.map(lockup => {
      return (
        <div key={lockup.id} className="mb-3">
          <LockupCard lockup={lockup} />
        </div>
      )
    })
  }

  return (
    <>
      {displayBonusModal && (
        <BonusModal
          balance={balanceAvailable}
          onModalClose={() => setDisplayBonusModal(false)}
        />
      )}

      <div className="row">
        <div className="col-12 col-md-6 mt-4">
          <h1 className="mb-0 mb-lg-4">Bonus Tokens</h1>
        </div>
        {!isLocked && (
          <div className="col-12 col-md-6 mb-3 mb-md-0 text-lg-right">
            <button
              className="btn btn-lg btn-dark"
              onClick={() => setDisplayBonusModal(true)}
            >
              Earn More
            </button>
          </div>
        )}
      </div>
      <div className="row">
        <div className="col">
          Total Locked Up{' '}
          <strong className="ml-2">
            {Number(props.lockupTotals.locked).toLocaleString()}
          </strong>{' '}
          <span className="ogn">OGN</span>
        </div>
        <div className="col">
          Total Earned{' '}
          <strong className="ml-2">
            {Number(props.lockupTotals.earnings).toLocaleString()}
          </strong>{' '}
          <span className="ogn">OGN</span>
        </div>
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
              <div style={{ fontSize: '18px' }}>
                This program is only available to our existing Advisor,
                Strategic, and CoinList investors.
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

const mapStateToProps = ({ grant, lockup, transfer, user }) => {
  return {
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
      fetchGrants: fetchGrants,
      fetchLockups: fetchLockups,
      fetchTransfers: fetchTransfers
    },
    dispatch
  )

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Lockup))
