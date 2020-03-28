import React, { useEffect, useState } from 'react'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { bindActionCreators } from 'redux'
import moment from 'moment'

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
import LockupCard from '@/components/LockupCard'
import BonusModal from '@/components/BonusModal'

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

      <div className="row align-items-center mb-4">
        <div className="col-3">
          <h1 className="mb-0">Bonus Tokens</h1>
        </div>
        <div className="col-6">
          <small>
            <strong className="ml-3 mr-2">Total Locked Up </strong>
            {Number(props.lockupTotals.locked).toLocaleString()} OGN
            <strong className="ml-3 mr-2">Total Earned </strong>
            {Number(props.lockupTotals.earnings).toLocaleString()} OGN
          </small>
        </div>
        {!isLocked && (
          <div className="col text-right">
            <button
              className="btn btn-lg btn-primary"
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
