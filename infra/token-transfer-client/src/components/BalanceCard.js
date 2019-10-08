import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import get from 'lodash.get'
import BigNumber from 'bignumber.js'
import web3Utils from 'web3-utils'

import { addAccount } from '@/actions/account'
import {
  getError as getAccountsError,
  getIsAdding as getAccountIsAdding
} from '@/reducers/account'
import { addTransfer } from '@/actions/transfer'
import {
  getError as getTransfersError,
  getIsAdding as getTransferIsAdding
} from '@/reducers/transfer'
import { formInput, formFeedback } from '@/utils/formHelpers'
import { unlockDate } from '@/constants'
import BorderedCard from '@/components/BorderedCard'
import Modal from '@/components/Modal'
import ClockIcon from '@/assets/clock-icon.svg'
import EmailIcon from '@/assets/email-icon.svg'
import ExportIcon from '@/assets/export-icon.svg'

class BalanceCard extends Component {
  constructor(props) {
    super(props)
    this.state = this.getInitialState()
  }

  componentDidUpdate(prevProps) {
    // Parse server errors for account add
    if (get(prevProps, 'accountError') !== this.props.accountError) {
      this.handleServerError(this.props.accountError)
    }
    // Parse server errors for transfer add
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
        console.error(error.response.body)
      }
    }
  }

  getInitialState = () => {
    const initialState = {
      address:
        this.props.accounts.length > 0 ? this.props.accounts[0].address : '',
      addressError: null,
      amount: '',
      amountError: null,
      code: '',
      codeError: null,
      displayModal: false,
      modalAddAccount: this.props.accounts.length === 0,
      modalState: 'Disclaimer',
      nickname: '',
      nicknameError: null,
      pendingTransfer: null
    }
    return initialState
  }

  handleTransferFormSubmit = async event => {
    event.preventDefault()

    if (BigNumber(this.state.amount).isGreaterThan(this.props.balance)) {
      this.setState({
        amountError: `Withdrawal amount is greater than your balance of ${Number(
          this.props.balance
        ).toLocaleString()} OGN`
      })
      return
    }

    if (!web3Utils.isAddress(this.state.address)) {
      this.setState({
        addressError: 'Not a valid Ethereum address'
      })
      return
    }

    if (this.state.modalAddAccount) {
      // Add account before processing request
      try {
        await this.props.addAccount({
          nickname: this.state.nickname,
          address: this.state.address
        })
      } catch (error) {
        // Error will be displayed in form, don't continue to two factor input
        return
      }
    }

    this.setState({ modalState: 'TwoFactor' })
  }

  handleTwoFactorFormSubmit = async event => {
    event.preventDefault()

    // Do the transfer
    const result = await this.props.addTransfer({
      amount: this.state.amount,
      address: this.state.address,
      code: this.state.code
    })

    if (result.type === 'ADD_TRANSFER_SUCCESS') {
      this.setState({ modalState: 'CheckEmail' })
    }
  }

  handleModalClose = () => {
    // Reset the state of the modal back to defaults
    this.setState(this.getInitialState())
  }

  handleAddAccount = () => {
    this.setState({
      ...this.getInitialState(),
      address: '',
      amount: this.state.amount,
      displayModal: true,
      modalAddAccount: !this.state.modalAddAccount,
      modalState: this.state.modalState
    })
  }

  handleChooseAccount = () => {
    this.setState({
      ...this.getInitialState(),
      amount: this.state.amount,
      displayModal: true,
      modalAddAccount: !this.state.modalAddAccount,
      modalState: this.state.modalState
    })
  }

  render() {
    return (
      <>
        {this.state.displayModal && this.renderModal()}

        <BorderedCard shadowed={true}>
          <div className="row header">
            <div className="col-8">
              <h2>Available Balance</h2>
            </div>
          </div>
          <div style={{ fontSize: '40px' }}>
            <strong>
              {this.props.isLocked
                ? 0
                : Number(this.props.balance).toLocaleString()}{' '}
              <span style={{ fontSize: '20px', color: '#007cff' }}>OGN</span>
            </strong>
          </div>
          <div>
            {this.props.isLocked ? (
              <>
                Lockup Period Ends{' '}
                <img src={ClockIcon} className="ml-3 mr-1 mb-1" />{' '}
                <strong>{unlockDate.fromNow(true)}</strong>
                <div className="alert alert-warning mt-3 mb-1 my-2">
                  <small className="text-muted">
                    Tokens will become available for withdrawal on{' '}
                    {unlockDate.format('L')}
                  </small>
                </div>
              </>
            ) : (
              <button
                className="btn btn-secondary btn-lg"
                onClick={() => this.setState({ displayModal: true })}
                disabled={
                  this.props.isLocked || Number(this.props.balance) === 0
                }
              >
                <img src={ExportIcon} className="mr-2 pb-1" />
                Withdraw
              </button>
            )}
          </div>
          {!this.props.isLocked && (
            <small className="text-muted">
              You will need an Ethereum wallet to withdraw OGN
            </small>
          )}
        </BorderedCard>
      </>
    )
  }

  renderModal() {
    return (
      <Modal appendToId="main" onClose={this.handleModalClose} closeBtn={true}>
        {this.state.modalState === 'Disclaimer' && this.renderDisclaimer()}
        {this.state.modalState === 'Form' && this.renderTransferForm()}
        {this.state.modalState === 'TwoFactor' && this.renderTwoFactor()}
        {this.state.modalState === 'CheckEmail' && this.renderCheckEmail()}
      </Modal>
    )
  }

  renderDisclaimer() {
    return (
      <>
        <h1 className="mb-2">Withdraw OGN</h1>
        <div className="alert alert-warning m-4">
          This transaction is not reversible and we cannot help you recover
          these funds
        </div>
        <ul className="my-4 mx-2 text-left">
          <li className="mt-1">
            Ut non eleifend enim. Curabitur tempor tellus nunc, sit amet
            vehicula enim porttitor id.
          </li>
          <li className="mt-1">
            Nam consequat est mi, eu semper augue interdum nec.
          </li>
          <li className="mt-1">
            Duis posuere lectus velit, vitae cursus velit molestie congue.
          </li>
          <li className="mt-1">
            Aenean justo tellus, vestibulum sit amet pharetra id, ultricies ut
            neque.
          </li>
        </ul>
        <button
          className="btn btn-primary btn-lg mt-5"
          onClick={() => this.setState({ modalState: 'Form' })}
        >
          Continue
        </button>
      </>
    )
  }

  renderTransferForm() {
    const input = formInput(this.state, state => this.setState(state))
    const Feedback = formFeedback(this.state)

    return (
      <>
        <h1 className="mb-2">Withdraw OGN</h1>
        <form onSubmit={this.handleTransferFormSubmit}>
          <div className="form-group">
            <label htmlFor="amount">Amount of Tokens</label>
            <div className="input-group">
              <input {...input('amount')} type="number" />
              <div className="input-group-append">
                <span className="badge badge-secondary">OGN</span>
              </div>
            </div>
            <div className={this.state.amountError ? 'input-group-fix' : ''}>
              {Feedback('amount')}
            </div>
          </div>
          {this.props.accounts.length > 0 && !this.state.modalAddAccount ? (
            <>
              <div className="form-group">
                <label htmlFor="address">Destination Account</label>
                <select
                  className="custom-select custom-select-lg"
                  value={this.state.address}
                  onChange={e => this.setState({ address: e.target.value })}
                >
                  {this.props.accounts.map(account => (
                    <option key={account.address} value={account.address}>
                      {account.nickname}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <a href="javascript:void(0);" onClick={this.handleAddAccount}>
                  Add Another Account
                </a>
              </div>
            </>
          ) : (
            <>
              <div className="form-group">
                <label htmlFor="address">Destination Account</label>
                <input {...input('address')} placeholder="0x..." />
                {Feedback('address')}
              </div>
              <div className="form-group">
                <label htmlFor="nickname">Destination Account Nickname</label>
                <input {...input('nickname')} />
                {Feedback('nickname')}
              </div>
              {this.props.accounts.length > 0 && (
                <div className="form-group">
                  <a
                    href="javascript:void(0);"
                    onClick={this.handleChooseAccount}
                  >
                    Choose Existing Account
                  </a>
                </div>
              )}
            </>
          )}
          <button
            type="submit"
            className="btn btn-primary btn-lg mt-5"
            disabled={this.props.accountIsAdding}
          >
            {this.props.accountIsAdding ? (
              <>
                <span className="spinner-grow spinner-grow-sm"></span>
                Loading...
              </>
            ) : (
              <span>Continue</span>
            )}
          </button>
        </form>
      </>
    )
  }

  renderTwoFactor() {
    const input = formInput(
      this.state,
      state => this.setState(state),
      'text-center w-auto'
    )
    const Feedback = formFeedback(this.state)

    return (
      <>
        <h1 className="mb-2">2-Step Verification</h1>
        <p>Enter the code generated by Google Authenticator.</p>
        <form onSubmit={this.handleTwoFactorFormSubmit}>
          <div className="form-group">
            <label htmlFor="code">Code</label>
            <input {...input('code')} type="number" />
            {Feedback('code')}
          </div>
          <button
            type="submit"
            className="btn btn-primary btn-lg mt-5"
            disabled={this.props.transferIsAdding}
          >
            {this.props.transferIsAdding ? (
              <>
                <span className="spinner-grow spinner-grow-sm"></span>
                Loading...
              </>
            ) : (
              <span>Verify</span>
            )}
          </button>
        </form>
      </>
    )
  }

  renderCheckEmail() {
    return (
      <>
        <h1 className="mb-2">Check your email</h1>
        <p>Please click the link in the email we just sent you</p>
        <div className="mt-5">
          <img src={EmailIcon} />
        </div>
        <button
          className="btn btn-primary btn-lg mt-5"
          onClick={this.handleModalClose}
        >
          Done
        </button>
      </>
    )
  }
}

const mapStateToProps = ({ account, transfer }) => {
  return {
    accountError: getAccountsError(account),
    accountIsAdding: getAccountIsAdding(account),
    transferError: getTransfersError(transfer),
    transferIsAdding: getTransferIsAdding(transfer)
  }
}

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      addAccount: addAccount,
      addTransfer: addTransfer
    },
    dispatch
  )

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(BalanceCard)
