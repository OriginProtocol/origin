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
  getIsAdding as getAccountIsAdding,
} from '@/reducers/account'
import { addTransfer } from '@/actions/transfer'
import {
  getError as getTransfersError,
  getIsAdding as getTransferIsAdding,
} from '@/reducers/transfer'
import { formInput, formFeedback } from '@/utils/formHelpers'
import Modal from '@/components/Modal'
import GoogleAuthenticatorIcon from '@/assets/google-authenticator-icon@2x.jpg'
import EmailIcon from '@/assets/email-icon.svg'
import OtcDesk from '@/assets/otc-desk.svg'
import OgnIcon from '@/assets/ogn-icon.svg'
import ModalStep from '@/components/ModalStep'

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
        error.response.body.errors.forEach((e) => {
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
      pendingTransfer: null,
    }
    return initialState
  }

  handleFormSubmit = async (event) => {
    event.preventDefault()

    if (BigNumber(this.state.amount).isGreaterThan(this.props.balance)) {
      this.setState({
        amountError: `Withdrawal amount is greater than your balance of ${Number(
          this.props.balance
        ).toLocaleString()} OGN`,
      })
      return
    }

    if (!web3Utils.isAddress(this.state.address)) {
      this.setState({
        addressError: 'Not a valid Ethereum address',
      })
      return
    }

    if (this.state.modalAddAccount) {
      // Add account before processing request
      try {
        await this.props.addAccount({
          nickname: this.state.nickname,
          address: this.state.address,
        })
      } catch (error) {
        // Error will be displayed in form, don't continue to two factor input
        return
      }
    }

    this.setState({ modalState: 'TwoFactor' })
  }

  handleTwoFactorFormSubmit = async (event) => {
    event.preventDefault()

    // Do the transfer
    const result = await this.props.addTransfer({
      amount: this.state.amount,
      address: this.state.address,
      code: this.state.code,
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

  handleAddAccount = (event) => {
    event.preventDefault()
    this.setState({
      ...this.getInitialState(),
      address: '',
      amount: this.state.amount,
      modalAddAccount: !this.state.modalAddAccount,
      modalState: this.state.modalState,
    })
  }

  handleChooseAccount = () => {
    this.setState({
      ...this.getInitialState(),
      amount: this.state.amount,
      modalAddAccount: !this.state.modalAddAccount,
      modalState: this.state.modalState,
    })
  }

  render() {
    return (
      <Modal
        className={`large-header${
          this.props.otcRequestEnabled ? ' modal-lg' : ''
        }`}
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

  renderTitle() {
    return (
      <div className="row text-center align-items-center text-sm-left mb-3">
        <div className="col-12 col-sm-2 text-center">
          <img src={OgnIcon} className="icon-xl" />
        </div>
        <div className="col">
          <h1 className="mb-2">Withdraw OGN</h1>
        </div>
      </div>
    )
  }

  renderDisclaimer() {
    return (
      <div className="text-left">
        {this.renderTitle()}

        <hr />

        <div className="row">
          <div className="col">
            <div className="row text-center align-items-center text-sm-left my-3">
              <div className="col">
                This transaction is <strong>not reversible</strong> and we{' '}
                <strong>cannot help you recover these funds</strong> once you
                take custody
              </div>
            </div>

            <hr />

            <div className="row text-center align-items-center text-sm-left my-3">
              <div className="col">
                You will need to <strong>confirm your withdrawal</strong> via
                email within <strong>five minutes</strong> of making a request.
              </div>
            </div>

            <hr />

            <div className="row text-center align-items-center text-sm-left my-3">
              <div className="col">
                Be sure that <strong>only you</strong> have access to your
                account and that your{' '}
                <strong>private key or seed phrase is backed up</strong> and
                stored safely.
              </div>
            </div>

            <hr />

            <div className="row text-center align-items-center text-sm-left my-3">
              <div className="col">
                Large withdrawals <strong>may be delayed</strong> and will
                require a <strong>phone call for verification.</strong>
              </div>
            </div>
          </div>

          {this.props.otcRequestEnabled && (
            <div className="col-5">
              <div
                className="card text-left p-4 mt-3 mr-3"
                style={{ backgroundColor: '#eff6f9' }}
              >
                <img src={OtcDesk} className="mb-3" />
                <strong className="mb-2">
                  Looking to sell a large quantity of OGN?
                </strong>
                <p>
                  Try an OTC (over-the-counter) trade. OTC trades oftentimes
                  result in a better overall price for large sellers.
                </p>
                <strong>
                  <a
                    href="#"
                    onClick={(e) => {
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

        <div className="actions">
          <div className="row">
            <div className="col"></div>
            <div className="col">
              <ModalStep steps={3} completedSteps={0} />
            </div>
            <div className="col text-right">
              <button
                className="btn btn-primary btn-lg"
                onClick={() => this.setState({ modalState: 'Form' })}
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  renderForm() {
    const input = formInput(this.state, (state) => this.setState(state))
    const Feedback = formFeedback(this.state)

    return (
      <>
        {this.renderTitle()}
        <hr />
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
                  onChange={(e) => this.setState({ address: e.target.value })}
                >
                  {this.props.accounts.map((account) => (
                    <option key={account.address} value={account.address}>
                      {account.nickname}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <a href="#" onClick={this.handleAddAccount}>
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
          <div className="actions">
            <div className="row">
              <div className="col">
                <button
                  className="btn btn-outline-primary btn-lg"
                  onClick={() => this.setState({ modalState: 'Disclaimer' })}
                >
                  Back
                </button>
              </div>
              <div className="col text-center">
                <ModalStep steps={3} completedSteps={1} />
              </div>
              <div className="col text-right">
                <button
                  type="submit"
                  className="btn btn-primary btn-lg"
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
              </div>
            </div>
          </div>
        </form>
      </>
    )
  }

  renderTwoFactor() {
    const input = formInput(
      this.state,
      (state) => this.setState(state),
      'text-center w-auto'
    )
    const Feedback = formFeedback(this.state)

    return (
      <>
        <img
          src={GoogleAuthenticatorIcon}
          className="mb-2"
          width="74"
          height="74"
        />
        <h1 className="mb-2">Enter your verification code</h1>
        <p className="text-muted">
          Enter the code generated by your authenticator app
        </p>
        <form onSubmit={this.handleTwoFactorFormSubmit}>
          <div className="form-group mb-5">
            <label htmlFor="code">Verification code</label>
            <input {...input('code')} placeholder="Enter code" type="number" />
            {Feedback('code')}
          </div>
          <div className="actions">
            <div className="row">
              <div className="col text-left">
                <button
                  className="btn btn-outline-primary btn-lg"
                  onClick={() => this.setState({ modalState: 'Form' })}
                >
                  Back
                </button>
              </div>
              <div className="col text-center">
                <ModalStep steps={3} completedSteps={2} />
              </div>
              <div className="col text-right">
                <button
                  type="submit"
                  className="btn btn-primary btn-lg"
                  disabled={this.props.transferIsAdding}
                >
                  {this.props.transferIsAdding ? (
                    <>Loading...</>
                  ) : (
                    <span>Verify</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </>
    )
  }

  renderCheckEmail() {
    return (
      <>
        <div className="mt-5 mb-3">
          <img src={EmailIcon} />
        </div>
        <h1 className="mb-2">Please check your email</h1>
        <p className="text-muted">
          Click the link in the email we just sent you
        </p>
        <div className="actions">
          <div className="row">
            <div className="col"></div>
            <div className="col text-center">
              <ModalStep steps={3} completedSteps={3} />
            </div>
            <div className="col text-right">
              <button
                className="btn btn-primary btn-lg"
                onClick={this.handleModalClose}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      </>
    )
  }
}

const mapStateToProps = ({ account, transfer }) => {
  return {
    accountError: getAccountsError(account),
    accountIsAdding: getAccountIsAdding(account),
    transferError: getTransfersError(transfer),
    transferIsAdding: getTransferIsAdding(transfer),
  }
}

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      addAccount: addAccount,
      addTransfer: addTransfer,
    },
    dispatch
  )

export default connect(mapStateToProps, mapDispatchToProps)(WithdrawModal)
