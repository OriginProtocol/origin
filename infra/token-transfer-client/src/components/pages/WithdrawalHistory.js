import React, { useEffect } from 'react'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { bindActionCreators } from 'redux'
import moment from 'moment'

import enums from '@origin/token-transfer-server/src/enums'

import { fetchAccounts } from '@/actions/account'
import {
  getAccounts,
  getIsLoading as getAccountIsLoading
} from '@/reducers/account'
import { fetchGrants } from '@/actions/grant'
import {
  getGrants,
  getIsLoading as getGrantIsLoading,
  getTotals as getGrantTotals
} from '@/reducers/grant'
import { employeeUnlockDate, investorUnlockDate } from '@/constants'
import { fetchTransfers } from '@/actions/transfer'
import {
  getTransfers,
  getIsLoading as getTransferIsLoading,
  getWithdrawnAmount
} from '@/reducers/transfer'
import WithdrawalHistoryCard from '@/components/WithdrawalHistoryCard'
import EthAddress from '@/components/EthAddress'

const WithdrawalHistory = props => {
  useEffect(() => {
    props.fetchAccounts(), props.fetchTransfers(), props.fetchGrants()
  }, [])

  if (
    props.accountIsLoading ||
    props.transferIsLoading ||
    props.grantIsLoading
  ) {
    return (
      <div className="spinner-grow" role="status">
        <span className="sr-only">Loading...</span>
      </div>
    )
  }

  const unlockDate = props.user.employee
    ? employeeUnlockDate
    : investorUnlockDate
  const isLocked = moment.utc() < unlockDate

  const accountNicknameMap = {}
  props.accounts.forEach(account => {
    accountNicknameMap[account.address.toLowerCase()] = account.nickname
  })

  return (
    <>
      <div className="row">
        <div className="col">
          <h1>Withdrawal History</h1>
        </div>
      </div>
      <div className="row">
        <div className="col">
          <WithdrawalHistoryCard
            isLocked={isLocked}
            withdrawnAmount={props.withdrawnAmount}
            {...props.grantTotals}
          />
        </div>
      </div>
      <div className="row">
        <div className="col">
          <div className="table-responsive">
            <table className="table table-clickable mt-4 mb-4">
              <thead>
                <tr>
                  <th>Amount</th>
                  <th>IP</th>
                  <th>Destination</th>
                  <th>Nickname</th>
                  <th>Time</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {props.transfers.length === 0 ? (
                  <tr>
                    <td className="table-empty-cell" colSpan="100%">
                      You have not made any withdrawals.
                    </td>
                  </tr>
                ) : (
                  props.transfers.map(transfer => (
                    <tr
                      key={transfer.id}
                      className="hoverable"
                      onClick={() =>
                        props.history.push(`/withdrawal/${transfer.id}`)
                      }
                    >
                      <td>{Number(transfer.amount).toLocaleString()} OGN</td>
                      <td>{transfer.data.ip}</td>
                      <td>
                        <EthAddress address={transfer.toAddress} />
                      </td>
                      <td className="text-nowrap">
                        {accountNicknameMap[transfer.toAddress]}
                      </td>
                      <td className="text-nowrap">
                        {moment(transfer.createdAt).fromNow()}
                      </td>
                      <td className="text-nowrap">
                        {transfer.status ===
                          enums.TransferStatuses.WaitingEmailConfirm &&
                          (moment
                            .utc()
                            .diff(moment(transfer.createdAt), 'minutes') > 5 ? (
                            <>
                              <div className="status-circle mr-2"></div>
                              Expired
                            </>
                          ) : (
                            <>
                              <div className="status-circle status-circle-warning mr-2"></div>
                              Email Confirmation
                            </>
                          ))}
                        {[
                          enums.TransferStatuses.Enqueued,
                          enums.TransferStatuses.WaitingConfirmation
                        ].includes(transfer.status) && (
                          <>
                            <div className="status-circle status-circle-warning mr-2"></div>
                            Processing
                          </>
                        )}
                        {transfer.status === enums.TransferStatuses.Paused && (
                          <>
                            <div className="status-circle status-circle-error mr-2"></div>
                            Paused
                          </>
                        )}
                        {transfer.status === enums.TransferStatuses.Success && (
                          <>
                            <div className="status-circle status-circle-success mr-2"></div>
                            Confirmed
                          </>
                        )}
                        {transfer.status === enums.TransferStatuses.Failed && (
                          <>
                            <div className="status-circle status-circle-error mr-2"></div>
                            Failed
                          </>
                        )}
                        {[
                          enums.TransferStatuses.Expired,
                          enums.TransferStatuses.Cancelled
                        ].includes(transfer.status) && (
                          <>
                            <div className="status-circle mr-2"></div>
                            {transfer.status}
                          </>
                        )}
                      </td>
                      <td>&rsaquo;</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  )
}

const mapStateToProps = ({ account, grant, transfer }) => {
  return {
    accounts: getAccounts(account),
    accountIsLoading: getAccountIsLoading(account),
    grants: getGrants(grant),
    grantIsLoading: getGrantIsLoading(grant),
    grantTotals: getGrantTotals(grant),
    transfers: getTransfers(transfer),
    transferIsLoading: getTransferIsLoading(transfer),
    withdrawnAmount: getWithdrawnAmount(transfer)
  }
}

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      fetchAccounts: fetchAccounts,
      fetchGrants: fetchGrants,
      fetchTransfers: fetchTransfers
    },
    dispatch
  )

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(WithdrawalHistory)
)
