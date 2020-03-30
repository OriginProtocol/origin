import React, { useEffect } from 'react'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { bindActionCreators } from 'redux'
import moment from 'moment'
import get from 'lodash.get'

import enums from '@origin/token-transfer-server/src/enums'

import { fetchConfig } from '@/actions/config'
import {
  getConfig,
  getIsLoading as getConfigIsLoading,
} from '@/reducers/config'
import { fetchAccounts } from '@/actions/account'
import {
  getAccounts,
  getIsLoading as getAccountIsLoading,
} from '@/reducers/account'
import { fetchGrants } from '@/actions/grant'
import {
  getGrants,
  getIsLoading as getGrantIsLoading,
  getTotals as getGrantTotals,
} from '@/reducers/grant'
import { fetchTransfers } from '@/actions/transfer'
import {
  getTransfers,
  getIsLoading as getTransferIsLoading,
  getWithdrawnAmount,
} from '@/reducers/transfer'
import EthAddress from '@/components/EthAddress'

const WithdrawalHistory = (props) => {
  useEffect(() => {
    props.fetchConfig(),
      props.fetchAccounts(),
      props.fetchTransfers(),
      props.fetchGrants()
  }, [])

  if (
    props.accountIsLoading ||
    props.configIsLoading ||
    props.transferIsLoading ||
    props.grantIsLoading
  ) {
    return (
      <div className="spinner-grow" role="status">
        <span className="sr-only">Loading...</span>
      </div>
    )
  }

  const isLocked =
    !props.config.unlockDate || moment.utc() < props.config.unlockDate

  const accountNicknameMap = {}
  props.accounts.forEach((account) => {
    accountNicknameMap[account.address.toLowerCase()] = account.nickname
  })

  return (
    <>
      <div className="row align-items-center">
        <div className="col-12 col-md-3">
          <h1 className="mb-2">History</h1>
        </div>
        <div className="col-12 col-md-2 text-right">
          <small>
            <strong>Available </strong>
            {isLocked
              ? 0
              : Number(
                  props.grantTotals.vestedTotal.minus(props.withdrawnAmount)
                ).toLocaleString()}{' '}
            OGN
          </small>
        </div>
        <div className="col-12 col-md-2 text-right">
          <small>
            <strong>Withdrawn </strong>
            <span className="text-nowrap">
              {Number(props.withdrawnAmount).toLocaleString()} OGN
            </span>
          </small>
        </div>
        <div className="col-12 col-md-2 text-right">
          <small>
            <strong>Unvested </strong>
            <span className="text-nowrap">
              {Number(props.grantTotals.unvestedTotal).toLocaleString()} OGN
            </span>
          </small>
        </div>
        <div className="col-12 col-md-3 text-right">
          <small>
            <strong>Total purchase </strong>
            <span className="text-nowrap">
              {Number(props.grantTotals.grantTotal).toLocaleString()} OGN
            </span>
          </small>
        </div>
      </div>
      <hr />
      <div className="row">
        <div className="col">
          <div className="table-responsive">
            <table className="table table-borderless table-card-rows table-clickable">
              <thead>
                <tr>
                  <th>Withdrawal Amount</th>
                  <th>IP</th>
                  <th>Destination</th>
                  <th>Nickname</th>
                  <th>Time</th>
                  <th>Status</th>
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
                  props.transfers.map((transfer) => (
                    <tr
                      key={transfer.id}
                      className="hoverable"
                      onClick={() =>
                        props.history.push(`/withdrawal/${transfer.id}`)
                      }
                    >
                      <td className="pl-4">
                        <strong>
                          {Number(transfer.amount).toLocaleString()}
                        </strong>{' '}
                        <span className="ogn">OGN</span>
                      </td>
                      <td>{get(transfer.data, 'ip', 'Unknown')}</td>
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
                              <div className="status-circle bg-red mr-2"></div>
                              Expired
                            </>
                          ) : (
                            <>
                              <div className="status-circle bg-orange mr-2"></div>
                              Email Confirmation
                            </>
                          ))}
                        {[
                          enums.TransferStatuses.Enqueued,
                          enums.TransferStatuses.WaitingConfirmation,
                          enums.TransferStatuses.Processing,
                        ].includes(transfer.status) && (
                          <>
                            <div className="status-circle bg-orange mr-2"></div>
                            Processing
                          </>
                        )}
                        {transfer.status === enums.TransferStatuses.Paused && (
                          <>
                            <div className="status-circle bg-red mr-2"></div>
                            Paused
                          </>
                        )}
                        {transfer.status === enums.TransferStatuses.Success && (
                          <>
                            <div className="status-circle bg-green mr-2"></div>
                            Confirmed
                          </>
                        )}
                        {transfer.status === enums.TransferStatuses.Failed && (
                          <>
                            <div className="status-circle bg-red mr-2"></div>
                            Failed
                          </>
                        )}
                        {[
                          enums.TransferStatuses.Expired,
                          enums.TransferStatuses.Cancelled,
                        ].includes(transfer.status) && (
                          <>
                            <div className="status-circle bg-red mr-2"></div>
                            {transfer.status}
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
      </div>
    </>
  )
}

const mapStateToProps = ({ account, config, grant, transfer, user }) => {
  return {
    accounts: getAccounts(account),
    accountIsLoading: getAccountIsLoading(account),
    config: getConfig(config),
    configIsLoading: getConfigIsLoading(config),
    grants: getGrants(grant),
    grantIsLoading: getGrantIsLoading(grant),
    grantTotals: getGrantTotals(user.user, grant),
    transfers: getTransfers(transfer),
    transferIsLoading: getTransferIsLoading(transfer),
    withdrawnAmount: getWithdrawnAmount(transfer),
  }
}

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchConfig: fetchConfig,
      fetchAccounts: fetchAccounts,
      fetchGrants: fetchGrants,
      fetchTransfers: fetchTransfers,
    },
    dispatch
  )

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(WithdrawalHistory)
)
