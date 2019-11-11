import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import moment from 'moment'

import enums from '@origin/token-transfer-server/src/enums'

import { confirmTransfer, fetchTransfers } from '@/actions/transfer'
import {
  getTransfers,
  getError as getTransferError,
  getIsLoading as getTransferIsLoading,
  getIsConfirming as getTransferIsConfirming
} from '@/reducers/transfer'
import BorderedCard from '@/components/BorderedCard'
import EthAddress from '@/components/EthAddress'
import ClockIcon from '@/assets/clock-icon.svg'

class WithdrawalDetail extends Component {
  constructor(props) {
    super(props)
  }

  componentDidMount() {
    this.props.fetchTransfers()
    // Force component update every three seconds because time passing won't
    // trigger an update as it is not in state. This is required to correctly
    // update when expired.
    this.interval = setInterval(() => this.forceUpdate(), 3000)
  }

  componentWillUnmount() {
    clearInterval(this.interval)
  }

  componentDidUpdate(prevProps) {
    if (prevProps.transferIsLoading && !this.props.transferIsLoading) {
      const token = this.props.match.params.token
      if (token) {
        const transferToConfirm = this.props.transfers.find(
          t => t.id == this.props.match.params.id
        )
        if (
          transferToConfirm &&
          transferToConfirm.status ===
            enums.TransferStatuses.WaitingEmailConfirm
        ) {
          this.props.confirmTransfer(transferToConfirm.id, token)
        }
      }
    }
  }

  render() {
    if (this.props.transferIsLoading || this.props.transferIsConfirming) {
      return (
        <div className="spinner-grow mb-3" role="status">
          <span className="sr-only">Loading...</span>
        </div>
      )
    }

    const transfer = this.props.transfers.find(
      t => t.id == this.props.match.params.id
    )

    const hasExpired =
      transfer.status === enums.TransferStatuses.Expired ||
      (transfer.status === enums.TransferStatuses.WaitingEmailConfirm &&
        moment.utc().diff(moment.utc(transfer.createdAt), 'minutes') > 5)

    if (!transfer) {
      return <div>Transfer not found</div>
    }

    return (
      <>
        {hasExpired && (
          <div className="alert alert-danger mb-4">
            This transaction has expired. It was not confirmed with two factor
            authentication in the required time.
          </div>
        )}
        {!hasExpired &&
          transfer.status === enums.TransferStatuses.WaitingEmailConfirm && (
            <div className="alert alert-warning mb-4">
              <strong>Next Step:</strong> Confirm your transaction with email
              link
              <br />
              <strong>Transaction will expire:</strong>{' '}
              <img src={ClockIcon} className="mx-1 mb-1" />{' '}
              {moment(transfer.createdAt)
                .add(5, 'minutes')
                .fromNow()}
            </div>
          )}
        <div className="row">
          <div className="col-12 col-xl-6">
            <BorderedCard shadowed={true}>
              <div className="row mb-3">
                <div className="col">
                  <strong>Amount</strong>
                </div>
                <div className="col">
                  {Number(transfer.amount).toLocaleString()} OGN
                </div>
              </div>
              <div className="row mb-3">
                <div className="col">
                  <strong>IP</strong>
                </div>
                <div className="col">{transfer.data.ip}</div>
              </div>
              <div className="row mb-3">
                <div className="col">
                  <strong>UserAgent</strong>
                </div>
                <div className="col">{transfer.data.device.source}</div>
              </div>
              <div className="row mb-3">
                <div className="col">
                  <strong>Destination</strong>
                </div>
                <div className="col">
                  <EthAddress address={transfer.toAddress} />
                </div>
              </div>
              <div className="row mb-3">
                <div className="col">
                  <strong>Time</strong>
                </div>
                <div className="col">
                  {moment(transfer.createdAt).fromNow()}
                </div>
              </div>
            </BorderedCard>
          </div>
          <div className="col-12 col-xl-6">
            <BorderedCard shadowed={true}>
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
    transfers: getTransfers(transfer),
    transferError: getTransferError(transfer),
    transferIsLoading: getTransferIsLoading(transfer),
    transferIsConfirming: getTransferIsConfirming(transfer)
  }
}

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      fetchTransfers: fetchTransfers,
      confirmTransfer: confirmTransfer
    },
    dispatch
  )

export default connect(mapStateToProps, mapDispatchToProps)(WithdrawalDetail)
