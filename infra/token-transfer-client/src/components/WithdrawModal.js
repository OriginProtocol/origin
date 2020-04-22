import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import get from 'lodash.get'
import BigNumber from 'bignumber.js'
import web3Utils from 'web3-utils'
import ReactGA from 'react-ga'
import moment from 'moment'

import { DataContext } from '@/providers/data'
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
import ModalStep from '@/components/ModalStep'
import TwoFactorStep from '@/components/modal/TwoFactorStep'
import CheckEmailStep from '@/components/modal/CheckEmailStep'
import ClockIcon from '@/assets/clock-icon.svg'
import WithdrawIcon from '@/assets/withdraw-icon.svg'
import EmailIcon from '@/assets/email-small-icon.svg'
import WalletIcon from '@/assets/wallet-icon.svg'
import DontIcon from '@/assets/dont-icon.svg'
import MobileIcon from '@/assets/mobile-icon.svg'
import WhaleIcon from '@/assets/whale-icon.svg'

class WithdrawModal extends Component {
  static contextType = DataContext

  constructor(props, context) {
    super(props)
    this.state = this.getInitialState(context)
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

  getInitialState = context => {
    const initialState = {
      address: context.accounts.length > 0 ? context.accounts[0].address : '',
      addressError: null,
      amount: '',
      amountError: null,
      code: '',
      codeError: null,
      modalAddAccount: context.accounts.length === 0,
      modalState: this.props.displayLockupCta ? 'LockupCta' : 'Disclaimer',
      nickname: '',
      nicknameError: null,
      pendingTransfer: null
    }
    return initialState
  }

  handleFormSubmit = async event => {
    event.preventDefault()

    if (
      BigNumber(this.state.amount).isGreaterThan(this.context.totals.balance)
    ) {
      this.setState({
        amountError: `Withdrawal amount is greater than your balance of ${Number(
          this.context.totals.balance
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
    this.setState(this.getInitialState(this.context))
    if (this.props.onModalClose) {
      this.props.onModalClose()
    }
  }

  handleAddAccount = event => {
    event.preventDefault()
    this.setState({
      ...this.getInitialState(this.context),
      address: '',
      amount: this.state.amount,
      modalAddAccount: !this.state.modalAddAccount,
      modalState: this.state.modalState
    })
  }

  handleChooseAccount = () => {
    event.preventDefault()
    this.setState({
      ...this.getInitialState(this.context),
      amount: this.state.amount,
      modalAddAccount: !this.state.modalAddAccount,
      modalState: this.state.modalState
    })
  }

  render() {
    return (
      <Modal
        appendToId="private"
        onClose={this.handleModalClose}
        closeBtn={true}
        className={this.state.modalState === 'LockupCta' ? 'blue-cta' : ''}
      >
        {this.state.modalState === 'LockupCta' && this.renderLockupCta()}
        {this.state.modalState === 'Disclaimer' && this.renderDisclaimer()}
        {this.state.modalState === 'Form' && this.renderForm()}
        {this.state.modalState === 'TwoFactor' && (
          <TwoFactorStep
            formState={{
              code: this.state.code,
              codeError: this.state.codeError
            }}
            onChangeFormState={state => this.setState(state)}
            onBackClick={() => this.setState({ modalState: 'Form' })}
            onSubmit={this.handleTwoFactorFormSubmit}
            isLoading={this.props.transferIsAdding}
            modalSteps={3}
            modalStepsCompleted={2}
          />
        )}
        {this.state.modalState === 'CheckEmail' && (
          <CheckEmailStep
            onDoneClick={this.handleModalClose}
            modalSteps={3}
            modalStepsCompleted={3}
          />
        )}
      </Modal>
    )
  }

  renderTitle() {
    return (
      <div className="row align-items-center mb-3 text-center text-sm-left">
        <div className="col">
          <WithdrawIcon
            className="mr-3 d-none d-sm-inline-block"
            style={{ marginTop: '-10px' }}
          />
          <h1 className="my-3 d-inline-block">Withdraw OGN</h1>
        </div>
      </div>
    )
  }

  renderLockupCta() {
    const now = moment()
    return (
      <>
        <div className="bg-wrapper">
          <div className="row">
            <div className="col">
              <h1>
                <strong>
                  EARN {this.context.config.earlyLockupBonusRate}%
                </strong>
                <br />
                for a limited time
              </h1>
              <p>
                For a limited time only, earn a{' '}
                {this.context.config.earlyLockupBonusRate}% bonus on your tokens
                that vest in month.
              </p>
              <p className="mb-0">This offer expires in</p>
              <p>
                <ClockIcon
                  className="icon-white"
                  style={{ transform: 'scale(0.5)', marginTop: '-0.4rem' }}
                />
                <strong>
                  {moment
                    .utc(this.context.config.earlyLockupsEnabledUntil)
                    .diff(now, 'days')}
                  d{' '}
                  {moment
                    .utc(this.context.config.earlyLockupsEnabledUntil)
                    .diff(now, 'hours') % 24}
                  h{' '}
                  {moment
                    .utc(this.context.config.earlyLockupsEnabledUntil)
                    .diff(now, 'minutes') % 60}
                  m
                </strong>
              </p>
            </div>
          </div>
        </div>
        <div className="actions">
          <div className="row">
            <div className="col text-right">
              <button
                className="btn btn-outline-light btn-lg"
                onClick={() => this.setState({ modalState: 'Disclaimer' })}
              >
                Not interested
              </button>
            </div>
            <div className="col text-left">
              <button
                className="btn btn-dark btn-lg"
                onClick={this.props.onCreateLockup}
              >
                Yes! I want this
              </button>
            </div>
          </div>
        </div>
      </>
    )
  }

  renderDisclaimer() {
    return (
      <div className="text-left">
        {this.renderTitle()}

        <div className="alert alert-warning my-4">
          This transaction is not reversible. We can&apos;t help you recover
          your tokens.
        </div>

        <div className="row align-items-center my-3">
          <div className="col-12 col-sm-1 mr-sm-4 text-center my-3 d-none d-sm-block">
            <EmailIcon className="mx-3" />
          </div>
          <div className="col">
            You will need to <strong>confirm your withdrawal via email</strong>{' '}
            within five minutes of making a request
          </div>
        </div>

        <hr />

        <div className="row align-items-center my-3">
          <div className="col-12 col-sm-1 mr-sm-4 text-center my-3 d-none d-sm-block">
            <WalletIcon className="mx-3" />
          </div>
          <div className="col">
            Be sure that <strong>only you have access to your account</strong>{' '}
            and that your private key or seed phrase is{' '}
            <strong>safely backed up and stored.</strong>
          </div>
        </div>

        <hr />

        <div className="row align-items-center my-3">
          <div className="col-12 col-sm-1 mr-sm-4 text-center my-3 d-none d-sm-block">
            <DontIcon className="mx-3" />
          </div>
          <div className="col">
            <strong>Do not send any funds</strong> back to the account that they
            are sent from
          </div>
        </div>

        <hr />

        <div className="row align-items-center my-3">
          <div className="col-12 col-sm-1 mr-sm-4 text-center my-3 d-none d-sm-block">
            <MobileIcon className="mx-3" />
          </div>
          <div className="col">
            Large withdrawals may be delayed and will{' '}
            <strong>require a phone call for verification</strong>
          </div>
        </div>

        <div className="actions">
          <div className="row">
            <div className="col d-none d-sm-block">
              <small>By continuing you acknowledge all of the above</small>
            </div>
            <div className="col text-sm-right mb-3 mb-sm-0">
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
    const input = formInput(this.state, state => this.setState(state))
    const Feedback = formFeedback(this.state)

    return (
      <>
        {this.renderTitle()}
        <hr />
        <form onSubmit={this.handleFormSubmit}>
          <div className="row">
            <div
              className={`col-12${
                this.context.config.otcRequestEnabled ? ' col-sm-6' : ''
              }`}
            >
              <div className="form-group">
                <label htmlFor="amount">Amount of Tokens</label>
                <div
                  className={`input-group ${
                    this.state.amountError ? 'is-invalid' : ''
                  }`}
                >
                  <input {...input('amount')} type="number" />
                  <div className="input-group-append">
                    <span className="badge badge-secondary">OGN</span>
                  </div>
                </div>
                <div
                  className={this.state.amountError ? 'input-group-fix' : ''}
                >
                  {Feedback('amount')}
                </div>
              </div>
              {this.context.accounts.length > 0 &&
              !this.state.modalAddAccount ? (
                <>
                  <div className="form-group">
                    <label htmlFor="address">Destination Account</label>
                    <select
                      className="custom-select custom-select-lg"
                      value={this.state.address}
                      onChange={e => this.setState({ address: e.target.value })}
                    >
                      {this.context.accounts.map(account => (
                        <option key={account.address} value={account.address}>
                          {account.nickname}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group text-left mt-4">
                    <a href="#" onClick={this.handleAddAccount}>
                      Add another account
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
                    <label htmlFor="nickname">
                      Destination Account Nickname
                    </label>
                    <input {...input('nickname')} />
                    {Feedback('nickname')}
                  </div>
                  {this.context.accounts.length > 0 && (
                    <div className="form-group text-left mt-4">
                      <a href="#" onClick={this.handleChooseAccount}>
                        Choose Existing Account
                      </a>
                    </div>
                  )}
                </>
              )}
            </div>

            {this.context.config.otcRequestEnabled && (
              <div className="col-12 col-sm-6">
                <div
                  className="card text-left p-4 mt-5"
                  style={{
                    backgroundColor: 'var(--highlight)',
                    fontSize: '15px'
                  }}
                >
                  <div className="text-center">
                    <WhaleIcon className="mb-3" />
                  </div>
                  <strong className="mb-2">
                    Selling a large quantity of OGN?
                  </strong>
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

          <div className="actions">
            <div className="row">
              <div className="col d-none d-sm-block">
                <button
                  type="button"
                  className="btn btn-outline-primary btn-lg"
                  onClick={() => this.setState({ modalState: 'Disclaimer' })}
                >
                  Back
                </button>
              </div>
              <div className="col text-center d-none d-sm-block">
                <ModalStep steps={3} completedSteps={1} />
              </div>
              <div className="col text-sm-right mb-3 mb-sm-0">
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
