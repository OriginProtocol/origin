import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import moment from 'moment'
import get from 'lodash.get'

import enums from '@origin/token-transfer-server/src/enums'

import { DataContext } from '@/providers/data'
import { confirmTransfer } from '@/actions/transfer'
import {
  getError as getTransferError,
  getIsLoading as getTransferIsLoading,
  getIsConfirming as getTransferIsConfirming
} from '@/reducers/transfer'
import BorderedCard from '@/components/BorderedCard'
import EthAddress from '@/components/EthAddress'
import ClockIcon from '@/assets/clock-icon.svg'

class WithdrawalDetail extends Component {
  static contextType = DataContext

  constructor(props) {
    super(props)
  }

  componentDidMount() {
    const token = this.props.match.params.token
    if (token) {
      const transferToConfirm = this.context.transfers.find(
        t => t.id == this.props.match.params.id
      )
      if (
        transferToConfirm &&
        transferToConfirm.status === enums.TransferStatuses.WaitingEmailConfirm
      ) {
        this.props.confirmTransfer(transferToConfirm.id, token)
      }
    }
    this.interval = setInterval(() => this.forceUpdate(), 3000)
  }

  componentWillUnmount() {
    clearInterval(this.interval)
  }

  render() {
    const transfer = this.context.transfers.find(
      t => t.id == this.props.match.params.id
    )

    if (!transfer) {
      return <div>Transfer not found</div>
    }

    const now = moment.utc()
    const expires = moment.utc(transfer.createdAt)
    const expiryString = `${Math.max(
      moment(transfer.createdAt)
        .add(5, 'minutes')
        .diff(now, 'minutes'),
      0
    )}m ${Math.max(
      moment(transfer.createdAt)
        .add(5, 'minutes')
        .diff(now, 'seconds') % 60,
      0
    )}s`
    const hasExpired =
      transfer.status === enums.TransferStatuses.Expired ||
      (transfer.status === enums.TransferStatuses.WaitingEmailConfirm &&
        moment.utc().diff(expires, 'minutes') > 5)

    return (
      <>
        <div className="row align-items-center">
          <div className="col">
            <h1>
              <span className="text-muted">History</span> &gt; Withdrawal
              Details
            </h1>
          </div>
        </div>

        {hasExpired && (
          <div className="alert alert-danger mb-4">
            This transaction has expired. It was not confirmed with two factor
            authentication in the required time.
          </div>
        )}
        {!hasExpired &&
          transfer.status === enums.TransferStatuses.WaitingEmailConfirm && (
            <div className="alert alert-warning mb-4">
              <div className="row">
                <div className="col">
                  <strong>Next Step:</strong> Check your inbox and click on the
                  link in the email we sent you to confirm this withdrawal.
                </div>
                <div className="col-12 col-sm-4 col-md-2 text-sm-right text-nowrap">
                  <ClockIcon
                    style={{ transform: 'scale(0.5)' }}
                    className="icon-blue"
                  />
                  {expiryString}
                </div>
              </div>
            </div>
          )}
        <div className="row">
          <div className="col-12 col-xl-6 mt-3">
            <BorderedCard>
              <div className="row mb-3">
                <div className="col">
                  <span className="text-muted">Amount</span>
                </div>
                <div className="col text-right">
                  <strong>{Number(transfer.amount).toLocaleString()} </strong>
                  <span className="ogn">OGN</span>
                </div>
              </div>
              <div className="row mb-3">
                <div className="col">
                  <span className="text-muted">IP</span>
                </div>
                <div className="col text-right">
                  <strong>{get(transfer.data, 'ip', 'Unknown')}</strong>
                </div>
              </div>
              <div className="row mb-3">
                <div className="col">
                  <span className="text-muted">UserAgent</span>
                </div>
                <div className="col text-right">
                  <strong>{transfer.data.device.source}</strong>
                </div>
              </div>
              <div className="row mb-3">
                <div className="col">
                  <span className="text-muted">Destination</span>
                </div>
                <div className="col text-right">
                  <strong>
                    <EthAddress address={transfer.toAddress} />
                  </strong>
                </div>
              </div>
              <div className="row mb-3">
                <div className="col">
                  <span className="text-muted">Time</span>
                </div>
                <div className="col text-right">
                  <strong>{moment(transfer.createdAt).fromNow()}</strong>
                </div>
              </div>
            </BorderedCard>
          </div>
          <div className="col-12 col-xl-6 mt-3">
            <BorderedCard>
              <ul>
                <li className="mb-3">
                  Be sure that only you have access to your account and that
                  your private key or seed phrase is backed up and stored
                  safely.
                </li>
                <li className="mb-3">
                  Do not send any funds back to the account that they are sent
                  from.
                </li>
                <li className="mb-3">
                  Large withdrawals may be delayed and will require a phone call
                  for verification.
                </li>
                <li className="mb-3">
                  Contact support if you have any questions about this
                  withdrawal.
                </li>
              </ul>
            </BorderedCard>
          </div>
        </div>
      </>
    )
  }
}

const mapStateToProps = ({ transfer }) => {
  return {
    transferError: getTransferError(transfer),
    transferIsLoading: getTransferIsLoading(transfer),
    transferIsConfirming: getTransferIsConfirming(transfer)
  }
}

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      confirmTransfer: confirmTransfer
    },
    dispatch
  )

export default connect(mapStateToProps, mapDispatchToProps)(WithdrawalDetail)
