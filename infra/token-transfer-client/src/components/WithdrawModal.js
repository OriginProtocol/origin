import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import get from 'lodash.get'
import BigNumber from 'bignumber.js'
import web3Utils from 'web3-utils'
import ReactGA from 'react-ga'

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
import Modal from '@/components/Modal'
import EmailIcon from '@/assets/email-icon.svg'
import { otcRequestEnabled } from '@/constants'
import OtcDesk from '@/assets/otc-desk.svg'

class WithdrawModal extends Component {
  constructor(props) {
    super(props)
    this.state = this.getInitialState()
  }

  componentDidMount() {
    ReactGA.modalview(`/withdraw/${this.state.modalState.toLowerCase()}`)
  }

  componentDidUpdate(prevProps, prevState) {
    // Parse server errors for account add
    if (get(prevProps, 'accountError') !== this.props.accountError) {
      this.handleServerError(this.props.accountError)
    }
    // Parse server errors for transfer add
    if (get(prevProps, 'transferError') !== this.props.transferError) {
      this.handleServerError(this.props.transferError)
    }
    if (prevState.modalState !== this.state.modalState) {
      ReactGA.modalview(`/withdraw/${this.state.modalState.toLowerCase()}`)
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
      modalAddAccount: this.props.accounts.length === 0,
      modalState: 'Disclaimer',
      nickname: '',
      nicknameError: null,
      pendingTransfer: null
    }
    return initialState
  }

  handleFormSubmit = async event => {
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
    if (this.props.onModalClose) {
      this.props.onModalClose()
    }
  }

  handleAddAccount = () => {
    this.setState({
      ...this.getInitialState(),
      address: '',
      amount: this.state.amount,
      modalAddAccount: !this.state.modalAddAccount,
      modalState: this.state.modalState
    })
  }

  handleChooseAccount = () => {
    this.setState({
      ...this.getInitialState(),
      amount: this.state.amount,
      modalAddAccount: !this.state.modalAddAccount,
      modalState: this.state.modalState
    })
  }

  render() {
    return (
      <Modal
        className="modal-lg"
        appendToId="main"
        onClose={this.handleModalClose}
        closeBtn={true}
      >
        {this.state.modalState === 'Disclaimer' && this.renderDisclaimer()}
        {this.state.modalState === 'Form' && this.renderForm()}
        {this.state.modalState === 'TwoFactor' && this.renderTwoFactor()}
        {this.state.modalState === 'CheckEmail' && this.renderCheckEmail()}
      </Modal>
    )
  }

  renderDisclaimer() {
    return (
      <>
        <h1 className="mb-4">Withdraw OGN</h1>
        <div className="alert alert-warning my-2 mx-4">
          This transaction is <strong>not reversible</strong> and we{' '}
          <strong>cannot help you recover these funds</strong> once you take
          custody
        </div>
        <div className="row">
          <div className="col">
            <ul className="my-4 text-left">
              <li className="mt-2">
                You will need to <strong>confirm your withdrawal</strong> via
                email within <strong>five minutes</strong> of making a request.
              </li>
              <li className="mt-2">
                Be sure that <strong>only you</strong> have access to your
                account and that your{' '}
                <strong>private key or seed phrase is backed up</strong> and
                stored safely.
              </li>
              <li className="mt-2">
                Do not send any funds back to the account that they are sent
                from.
              </li>
              <li className="mt-2">
                Large withdrawals <strong>may be delayed</strong> and will
                require a <strong>phone call for verification.</strong>
              </li>
            </ul>
          </div>
          {otcRequestEnabled && (
            <div className="col-5">
              <div
                className="card text-left p-4 mt-4 mr-3"
                style={{ backgroundColor: '#eff6f9' }}
              >
                <img src={OtcDesk} className="mb-3" />
                <strong className="mb-2">Looking to sell a large quantity of OGN?</strong>
                <p>
                  Try an OTC (over-the-counter) trade. OTC trades oftentimes
                  result in a better overall price for large sellers.
                </p>
                <strong>
                  <a
                    href="#"
                    onClick={e => {
                      e.preventDefault()
                      this.handleModalClose()
                      this.props.onCreateOtcRequest()
                    }}
                  >
                    Create OTC Request &gt;
                  </a>
                </strong>
              </div>
            </div>
          )}
        </div>
        <button
          className="btn btn-primary btn-lg mt-5"
          onClick={() => this.setState({ modalState: 'Form' })}
        >
          Continue
        </button>
      </>
    )
  }

  renderForm() {
    const input = formInput(this.state, state => this.setState(state))
    const Feedback = formFeedback(this.state)

    return (
      <>
        <h1 className="mb-2">Withdraw OGN</h1>
        <form onSubmit={this.handleFormSubmit}>
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
            disabled={this.state.amount < 1 || this.props.accountIsAdding}
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
        <h1 className="mb-2">Check Your Email</h1>
        <p>Please click the link in the email we just sent you.</p>
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

export default connect(mapStateToProps, mapDispatchToProps)(WithdrawModal)
