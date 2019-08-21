import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import moment from 'moment'
import get from 'lodash.get'

import { confirmTransfer, fetchTransfers } from '@/actions/transfer'
import {
  getTransfers,
  getError as getTransferError,
  getIsLoading as getTransferIsLoading,
  getIsConfirming as getTransferIsConfirming
} from '@/reducers/transfer'
import { formInput, formFeedback } from '@/utils/formHelpers'
import BorderedCard from '@/components/BorderedCard'
import EthAddress from '@/components/EthAddress'
import ClockIcon from '@/assets/clock-icon.svg'
import Modal from '@/components/Modal'

class WithdrawalDetail extends Component {
  constructor(props) {
    super(props)
    this.state = {
      code: '',
      codeError: null,
      displayModal: false
    }
  }

  componentDidMount() {
    this.props.fetchTransfers()
  }

  componentDidUpdate(prevProps) {
    // Parse server errors for transfer confirm
    if (get(prevProps, 'transferError') !== this.props.transferError) {
      this.handleServerError(this.props.transferError)
    }
  }

  handleServerError(error) {
    if (error && error.status === 422) {
      // Parse validation errors from API
      if (error.response.body && error.response.body.errors) {
        error.response.body.errors.forEach(e => {
          this.setState({ [`${e.param}Error`]: e.msg })
        })
      } else {
        // General errors, apply to code field as it is the only field in
        // the form
        this.setState({
          codeError: error.response.text
        })
      }
    }
  }

  handleConfirm = async transfer => {
    const result = await this.props.confirmTransfer(
      transfer.id,
      this.state.code
    )
    if (result.type === 'CONFIRM_TRANSFER_SUCCESS') {
      this.setState({
        code: '',
        codeError: null,
        displayModal: false
      })
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
      transfer.status === 'Expired' ||
      (transfer.status === 'WaitingTwoFactor' &&
        moment.utc(transfer.createdAt).diff(moment.utc(), 'minutes' > 5))

    if (!transfer) {
      return <div>Transfer not found</div>
    }

    return (
      <>
        {this.state.displayModal && this.renderModal(transfer)}

        {hasExpired && (
          <div className="alert alert-danger">
            This transaction has expired. It was not confirmed with two factor
            authentication in the required time.
          </div>
        )}
        {(!hasExpired && transfer.status === 'WaitingTwoFactor') ||
          (true && (
            <div className="alert alert-warning">
              <strong>Next Step:</strong> Confirm your transaction with{' '}
              <a
                href="javascript:void(0)"
                onClick={() => this.setState({ displayModal: true })}
              >
                two factor authentication
              </a>
              <br />
              <strong>Transaction will expire in:</strong>{' '}
              <img src={ClockIcon} className="ml-3 mr-1 mb-1" />{' '}
              {moment(transfer.createdAt)
                .add(5, 'minutes')
                .fromNow()}
            </div>
          ))}
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
        <small>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. Sed arcu
          non odio euismod. Donec massa sapien faucibus et molestie. Massa massa
          ultricies mi quis hendrerit dolor magna. Malesuada fames ac turpis
          egestas integer.
        </small>
      </>
    )
  }

  renderModal(transfer) {
    const input = formInput(this.state, state => this.setState(state))
    const Feedback = formFeedback(this.state)

    return (
      <Modal appendToId="main" closeBtn={true}>
        <h1>2-Step Verification</h1>
        <p>Enter the code generated by your authenticator app</p>
        <form onSubmit={this.handleConfirm}>
          <div className="form-group">
            <label htmlFor="email">QR Code</label>
            <input {...input('code')} />
            {Feedback('code')}
          </div>
          <button
            type="submit"
            className="btn btn-primary btn-lg"
            style={{ marginTop: '40px' }}
            onClick={() => this.handleConfirm(transfer)}
            disabled={this.props.transferIsConfirming}
          >
            {this.props.transferIsConfirming ? (
              <>
                <span className="spinner-grow spinner-grow-sm"></span>
                Loading...
              </>
            ) : (
              <span>Verify</span>
            )}
          </button>
        </form>
      </Modal>
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
