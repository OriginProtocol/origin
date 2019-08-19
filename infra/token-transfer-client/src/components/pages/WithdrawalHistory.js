import React, { useEffect } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import moment from 'moment'

import { fetchAccounts } from '@/actions/account'
import {
  getAccounts,
  getIsLoading as getAccountIsLoading
} from '@/reducers/account'
import { fetchTransfers } from '@/actions/transfer'
import {
  getTransfers,
  getIsLoading as getTransferIsLoading
} from '@/reducers/transfer'

const WithdrawalHistory = props => {
  useEffect(() => {
    props.fetchAccounts(), props.fetchTransfers()
  }, [])

  if (props.accountIsLoading || props.transferIsLoading) {
    return (
      <div className="spinner-grow" role="status">
        <span className="sr-only">Loading...</span>
      </div>
    )
  }

  const accountNicknameMap = {}
  props.accounts.forEach(account => {
    accountNicknameMap[account.address.toLowerCase()] = account.nickname
  })

  return (
    <>
      <div className="row">
        <div className="col">
          <h1>Withdrawal WithdrawalHistory</h1>
        </div>
      </div>
      <div className="row">
        <div className="col">
          <table className="table table-responsive mt-4 mb-4">
            <thead>
              <tr>
                <th>Amount</th>
                <th>Destination</th>
                <th>Nickname</th>
                <th>Time</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {props.transfers.length === 0 ? (
                <tr>
                  <td className="table-empty-cell" colSpan="4">
                    You don&apos;t have any withdrawals
                  </td>
                </tr>
              ) : (
                props.transfers.map(transfer => (
                  <tr key={transfer.id}>
                    <td>{transfer.amount}</td>
                    <td>{transfer.toAddress}</td>
                    <td className="text-nowrap">
                      {accountNicknameMap[transfer.toAddress]}
                    </td>
                    <td className="text-nowrap">
                      {moment(transfer.createdAt).fromNow()}
                    </td>
                    <td className="text-nowrap">
                      {['Enqueued', 'WaitingConfirmation'].includes(
                        transfer.status
                      ) && (
                        <>
                          <div className="status-circle status-circle-warning mr-2"></div>
                          Processing
                        </>
                      )}
                      {transfer.status === 'Paused' && (
                        <>
                          <div className="status-circle status-circle-error mr-2"></div>
                          Paused
                        </>
                      )}
                      {transfer.status === 'Success' && (
                        <>
                          <div className="status-circle status-circle-success mr-2"></div>
                          Confirmed
                        </>
                      )}
                      {transfer.status === 'Failed' && (
                        <>
                          <div className="status-circle status-circle-error mr-2"></div>
                          Failed
                        </>
                      )}
                      {transfer.status === 'Cancelled' && (
                        <>
                          <div className="status-circle mr-2"></div>
                          Cancelled
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}

const mapStateToProps = ({ account, transfer }) => {
  return {
    accounts: getAccounts(account),
    accountIsLoading: getAccountIsLoading(account),
    transfers: getTransfers(transfer),
    transferIsLoading: getTransferIsLoading(transfer)
  }
}

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      fetchAccounts: fetchAccounts,
      fetchTransfers: fetchTransfers
    },
    dispatch
  )

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(WithdrawalHistory)
