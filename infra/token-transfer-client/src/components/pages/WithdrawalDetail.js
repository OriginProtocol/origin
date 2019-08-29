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
    if (this.props.transferIsLoading) {
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
          <div className="alert alert-danger">
            This transaction has expired. It was not confirmed with two factor
            authentication in the required time.
          </div>
        )}
        {!hasExpired &&
          transfer.status === enums.TransferStatuses.WaitingEmailConfirm && (
            <div className="alert alert-warning">
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
                  {transfer.amount.toLocaleString()} OGN
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
                  Ut non eleifend enim. Curabitur tempor tellus nunc, sit amet
                  vehicula enim porttitor id.
                </li>
                <li className="mb-3">
                  Nam consequat est mi, eu semper augue interdum nec.
                </li>
                <li className="mb-3">
                  Duis posuere lectus velit, vitae cursus velit molestie congue.
                </li>
                <li className="mb-3">
                  Aenean justo tellus, vestibulum sit amet pharetra id,
                  ultricies ut neque.
                </li>
              </ul>
            </BorderedCard>
          </div>
        </div>
        <small className="text-muted">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. Sed arcu
          non odio euismod. Donec massa sapien faucibus et molestie. Massa massa
          ultricies mi quis hendrerit dolor magna. Malesuada fames ac turpis
          egestas integer.
        </small>
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

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(WithdrawalDetail)
