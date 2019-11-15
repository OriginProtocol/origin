import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import BigNumber from 'bignumber.js'
import get from 'lodash.get'

import { addLockup } from '@/actions/lockup'
import {
  getError as getLockupsError,
  getIsAdding as getLockupIsAdding
} from '@/reducers/lockup'
import { formInput, formFeedback } from '@/utils/formHelpers'
import Modal from '@/components/Modal'
import EmailIcon from '@/assets/email-icon.svg'
import { lockupBonusRate } from '@/constants'

class BonusModal extends Component {
  constructor(props) {
    super(props)
    this.state = this.getInitialState()
  }

  componentDidUpdate(prevProps) {
    // Parse server errors for account add
    if (get(prevProps, 'lockupError') !== this.props.lockupError) {
      this.handleServerError(this.props.lockupError)
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
      acceptedTerms: false,
      amount: '',
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
      <>
        <h1 className="mb-2">Earn Bonus Tokens</h1>
        <form onSubmit={this.handleFormSubmit}>
          <div className="form-group">
            <label htmlFor="amount">Number of Tokens to Lock Up</label>
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
            <div className={this.state.amountError ? 'input-group-fix' : ''}>
              {Feedback('amount')}
            </div>
          </div>

          {this.state.amount && this.state.amount >= 10 ? (
            <div className="text-left">
              <div className="row">
                <div className="col">
                  <strong>Bonus Tokens Earned</strong>{' '}
                  <span style={{ fontSize: '14px' }}>
                    ({lockupBonusRate}% of lockup)
                  </span>
                </div>
                <div className="col-4 text-right">
                  <strong>
                    {Number(
                      BigNumber(
                        this.state.amount * (lockupBonusRate / 100)
                      ).toFixed(0, BigNumber.ROUND_UP)
                    ).toLocaleString()}
                  </strong>{' '}
                  <span className="ogn">OGN</span>
                </div>
              </div>
              <div className="row">
                <div className="col">
                  <strong>Tokens Locked Up</strong>
                </div>
                <div className="col-4 text-right">
                  <strong>{Number(this.state.amount).toLocaleString()}</strong>{' '}
                  <span className="ogn">OGN</span>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="p-5 mx-4 text-muted text-center">
                Please enter the number of tokens (minimum 100 OGN) to lock up
                for one year. Bonus tokens will be calculated based on this
                amount. Locked up and bonus tokens will be unavailable for
                withdrawal during the one-year lockup.
              </div>
              <hr />
            </>
          )}

          <button
            type="submit"
            className="btn btn-primary btn-lg mt-5"
            disabled={
              !this.state.amount ||
              this.state.amount <= 10 ||
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
        </form>
      </>
    )
  }

  renderDisclaimer() {
    return (
      <>
        <h1 className="mb-2">Earn Bonus Tokens</h1>
        <ul className="my-4 mx-2 text-left">
          <li className="mt-1">
            Earn {lockupBonusRate}% bonus tokens immediately by locking up your
            vested OGN tokens.
          </li>
          <li className="mt-1">
            Locked and bonus tokens will be available for withdrawal after 1
            year.
          </li>
          <li className="mt-1">
            This program is only available to our existing Advisor, Strategic,
            and CoinList investors. Thank you for your early support of Origin.
          </li>
        </ul>
        <div className="form-check">
          <input
            className="form-check-input"
            type="checkbox"
            value=""
            id="acceptCheck"
            onClick={e => this.setState({ acceptedTerms: e.target.checked })}
          />
          <label className="form-check-label mt-0" htmlFor="acceptCheck">
            I certify that I am an{' '}
            <a
              href="https://www.investor.gov/additional-resources/news-alerts/alerts-bulletins/updated-investor-bulletin-accredited-investors"
              target="_blank"
              rel="noopener noreferrer"
            >
              accredited investor
            </a>
            .
          </label>
        </div>
        <button
          className="btn btn-primary btn-lg mt-5"
          onClick={() => this.setState({ modalState: 'Form' })}
          disabled={!this.state.acceptedTerms}
        >
          Continue
        </button>
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
        <p>
          Please use Google Authenticator to confirm your lockup and earn more
          OGN.
        </p>
        <form onSubmit={this.handleTwoFactorFormSubmit}>
          <div className="form-group">
            <label htmlFor="code">Code</label>
            <input {...input('code')} type="number" />
            {Feedback('code')}
          </div>
          <button
            type="submit"
            className="btn btn-primary btn-lg mt-5"
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
