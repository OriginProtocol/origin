import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import BigNumber from 'bignumber.js'
import get from 'lodash.get'
import ReactGA from 'react-ga'
import moment from 'moment'

import { addLockup } from '@/actions/lockup'
import {
  getError as getLockupsError,
  getIsAdding as getLockupIsAdding
} from '@/reducers/lockup'
import { formInput, formFeedback } from '@/utils/formHelpers'
import Modal from '@/components/Modal'
import EmailIcon from '@/assets/email-icon.svg'
import GoogleAuthenticatorIcon from '@/assets/google-authenticator-icon@2x.jpg'

class BonusModal extends Component {
  constructor(props) {
    super(props)
    this.state = this.getInitialState()
  }

  componentDidMount() {
    ReactGA.modalview(`/lockup/${this.state.modalState.toLowerCase()}`)
  }

  componentDidUpdate(prevProps, prevState) {
    // Parse server errors for account add
    if (get(prevProps, 'lockupError') !== this.props.lockupError) {
      this.handleServerError(this.props.lockupError)
    }

    if (prevState.modalState !== this.state.modalState) {
      ReactGA.modalview(`/lockup/${this.state.modalState.toLowerCase()}`)
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
      amount: this.props.balance ? Number(this.props.balance) : 0,
      amountError: null,
      code: '',
      codeError: null,
      modalState: 'Disclaimer'
    }
    return initialState
  }

  handleModalClose = () => {
    // Reset the state of the modal back to defaults
    this.setState(this.getInitialState())
    if (this.props.onModalClose) {
      this.props.onModalClose()
    }
  }

  handleFormSubmit = () => {
    event.preventDefault()

    if (BigNumber(this.state.amount).isGreaterThan(this.props.balance)) {
      this.setState({
        amountError: `Lock up amount is greater than your balance of ${Number(
          this.props.balance
        ).toLocaleString()} OGN`
      })
      return
    }

    this.setState({ modalState: 'TwoFactor' })
  }

  handleTwoFactorFormSubmit = async event => {
    event.preventDefault()

    // Add the lockup
    const result = await this.props.addLockup({
      amount: this.state.amount,
      code: this.state.code
    })

    if (result.type === 'ADD_LOCKUP_SUCCESS') {
      this.setState({ modalState: 'CheckEmail' })
    }
  }

  onMaxAmount = event => {
    event.preventDefault()

    this.setState({
      amount: Number(this.props.balance)
    })
  }

  render() {
    return (
      <Modal appendToId="main" onClose={this.handleModalClose} closeBtn={true}>
        {this.state.modalState === 'Disclaimer' && this.renderDisclaimer()}
        {this.state.modalState === 'Form' && this.renderForm()}
        {this.state.modalState === 'TwoFactor' && this.renderTwoFactor()}
        {this.state.modalState === 'CheckEmail' && this.renderCheckEmail()}
      </Modal>
    )
  }

  renderForm() {
    const input = formInput(this.state, state => this.setState(state))
    const Feedback = formFeedback(this.state)

    return (
      <div className="text-left">
        <h1 className="mb-2">{this.renderTitle()}</h1>
        <hr />
        <form onSubmit={this.handleFormSubmit}>
          <div className="row">
            <div className="col-7">
              {this.props.isEarlyLockup && (
                <div className="form-group">
                  <label htmlFor="amount">Eligible tokens</label>
                  <div className="faux-input form-control form-control-lg">
                    <strong>
                      {Number(this.props.nextVest.amount).toLocaleString()} OGN
                    </strong>{' '}
                    vest on {moment(this.props.nextVest.date).format('L')}
                  </div>
                </div>
              )}
              <div className="form-group">
                <label htmlFor="amount">Amount of tokens to lock Up</label>
                <div className="input-group">
                  <input {...input('amount')} type="number" />
                  <div className="input-group-append">
                    <a
                      href="#"
                      onClick={this.onMaxAmount}
                      className="mr-2"
                      style={{
                        color: '#007cff',
                        fontSize: '14px',
                        textDecoration: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      Max Amount
                    </a>
                    <span className="badge badge-secondary">OGN</span>
                  </div>
                </div>
                <div
                  className={this.state.amountError ? 'input-group-fix' : ''}
                >
                  {Feedback('amount')}
                </div>
              </div>
            </div>

            <div className="col-5"></div>
          </div>

          <div className="actions">
            <div className="row">
              <div className="col-6">
                <button
                  className="btn btn-outline-primary btn-lg"
                  onClick={() => this.setState({ modalState: 'Disclaimer' })}
                >
                  Back
                </button>
              </div>
              <div className="col-6 text-right">
                <button
                  type="submit"
                  className="btn btn-primary btn-lg"
                  disabled={
                    !this.state.amount ||
                    this.state.amount < 100 ||
                    this.props.lockupIsAdding
                  }
                >
                  {this.props.lockupIsAdding ? (
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
      </div>
    )
  }

  renderTitle() {
    const nextVestMonth = moment(this.props.nextVest.date).format('MMMM')
    if (this.props.isEarlyLockup) {
      return `Special offer for ${nextVestMonth} vesting`
    } else {
      return 'Earn Bonus Tokens'
    }
  }

  renderDisclaimer() {
    const nextVestMonth = moment(this.props.nextVest.date).format('MMMM')
    return (
      <div className="text-left">
        <h1 className="mb-2">{this.renderTitle()}</h1>
        <hr />
        <div>
          {this.props.isEarlyLockup ? (
            <>
              Earn <strong>{this.props.lockupBonusRate}%</strong> bonus tokens
              immediately by locking up your {nextVestMonth} vest.
            </>
          ) : (
            <>
              Earn <strong>${this.props.lockupBonusRate}%</strong> bonus tokens
              immediately by locking up your vested OGN tokens.`
            </>
          )}
        </div>
        <hr />
        <div>
          All tokens will be available for withdrawal after{' '}
          <strong>1 year</strong>
        </div>
        <hr />
        <div>
          <strong>{Number(this.props.nextVest.amount).toLocaleString()}</strong>{' '}
          OGN are scheduled to vest in {nextVestMonth}
        </div>
        <hr />
        <div>
          This offer expires in <strong>30d 23h 12m</strong>
        </div>
        <div className="actions">
          <div className="row">
            <div className="col-7 align-self-center">
              <small>
                By continuing you certify that you are an{' '}
                <a
                  href="https://www.investor.gov/additional-resources/news-alerts/alerts-bulletins/updated-investor-bulletin-accredited-investors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  accredited investor
                </a>
              </small>
            </div>
            <div className="col-5 text-right">
              <button
                className="btn btn-primary btn-lg"
                onClick={() => this.setState({ modalState: 'Form' })}
              >
                Get started
              </button>
            </div>
          </div>
        </div>
      </div>
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
          <div className="form-group">
            <label htmlFor="code">Verification code</label>
            <input {...input('code')} placeholder="Enter code" type="number" />
            {Feedback('code')}
          </div>
          <div className="actions">
            <div className="row">
              <div className="col-6 text-left">
                <button
                  className="btn btn-outline-primary btn-lg"
                  onClick={() => this.setState({ modalState: 'Form' })}
                >
                  Back
                </button>
              </div>
              <div className="col-6 text-right">
                <button
                  type="submit"
                  className="btn btn-primary btn-lg"
                  disabled={this.props.lockupIsAdding}
                >
                  {this.props.lockupIsAdding ? (
                    <>
                      <span className="spinner-grow spinner-grow-sm"></span>
                      Loading...
                    </>
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

const mapStateToProps = ({ lockup }) => {
  return {
    lockupError: getLockupsError(lockup),
    lockupIsAdding: getLockupIsAdding(lockup)
  }
}

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      addLockup: addLockup
    },
    dispatch
  )

export default connect(mapStateToProps, mapDispatchToProps)(BonusModal)
