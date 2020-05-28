import React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import BigNumber from 'bignumber.js'
import get from 'lodash.get'
import ReactGA from 'react-ga'
import moment from 'moment'

import { lockupConfirmationTimeout } from '@origin/token-transfer-server/src/shared'

import { DataContext } from '@/providers/data'
import { addLockup } from '@/actions/lockup'
import {
  getError as getLockupsError,
  getIsAdding as getLockupIsAdding
} from '@/reducers/lockup'
import { formInput, formFeedback } from '@/utils/formHelpers'
import Modal from '@/components/Modal'
import BonusGraph from '@/components/BonusGraph'
import ModalStep from '@/components/ModalStep'
import TwoFactorStep from '@/components/modal/TwoFactorStep'
import CheckEmailStep from '@/components/modal/CheckEmailStep'

import OgnIcon from '@/assets/ogn-icon.svg'
import YieldIcon from '@/assets/yield-icon.svg'
import TokensIcon from '@/assets/tokens-icon.svg'
import ClockIcon from '@/assets/clock-icon.svg'
import CalendarIcon from '@/assets/calendar-icon.svg'

class BonusModal extends React.Component {
  static contextType = DataContext

  constructor(props, context) {
    super(props)
    this.state = this.getInitialState(context)
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

  // Helper function to allow resetting to initial state
  getInitialState = context => {
    const initialState = {
      amount: this.getBalance(context) || 0,
      amountError: null,
      code: '',
      codeError: null,
      modalState: 'Disclaimer'
    }

    return initialState
  }

  handleServerError = error => {
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

  handleModalClose = () => {
    // Reset the state of the modal back to defaults
    this.setState(this.getInitialState(this.context))
    if (this.props.onModalClose) {
      this.props.onModalClose()
    }
  }

  handleFormSubmit = () => {
    event.preventDefault()

    const balance = this.getBalance(this.context)
    const exceedsBalance = BigNumber(this.state.amount).isGreaterThan(balance)

    if (exceedsBalance) {
      this.setState({
        amountError: `Lock up amount is greater than your balance of ${Number(
          balance
        ).toLocaleString()} OGN`
      })
      return
    }

    if (BigNumber(this.state.amount).isLessThan(100)) {
      this.setState({
        amountError: `Lock up amount must be at least 100 OGN`
      })
      return
    }

    const existingUnconfirmed = this.context.lockups.find(lockup => {
      return (
        !lockup.confirmed &&
        moment(lockup.createdAt) >
          moment().subtract(lockupConfirmationTimeout, 'minutes')
      )
    })

    if (existingUnconfirmed) {
      this.setState({
        amountError: `Unconfirmed lock ups exist, please confirm or wait until expiry`
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
      code: this.state.code,
      early: this.props.isEarlyLockup
    })
    if (result.type === 'ADD_LOCKUP_SUCCESS') {
      this.setState({ modalState: 'CheckEmail' })
    }
  }

  onMaxAmount = event => {
    event.preventDefault()
    this.setState({ amount: this.getBalance(this.context) })
  }

  getBalance = context => {
    return this.props.isEarlyLockup
      ? this.props.nextVest.amount.minus(context.totals.nextVestLocked)
      : context.totals.balance
  }

  render() {
    return (
      <Modal
        appendToId="private"
        onClose={this.handleModalClose}
        closeBtn={true}
      >
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
            isLoading={this.props.lockupIsAdding}
            modalSteps={3}
            modalStepsCompleted={2}
          />
        )}
        {this.state.modalState === 'CheckEmail' && (
          <CheckEmailStep
            onDoneClick={this.handleModalClose}
            modalSteps={3}
            modalStepsCompleted={3}
            text="Click the link in the email we just sent you to confirm your lockup"
          />
        )}
      </Modal>
    )
  }

  renderForm() {
    const input = formInput(this.state, state => this.setState(state))
    const Feedback = formFeedback(this.state)

    return (
      <div className="text-left">
        {this.renderTitle()}
        <hr />
        <form onSubmit={this.handleFormSubmit}>
          <div className="row">
            <div className="col-12 col-sm-7 pr-4">
              {this.props.isEarlyLockup && (
                <div className="form-group">
                  <label htmlFor="amount">Eligible tokens</label>
                  <div className="faux-input form-control form-control-lg">
                    <strong>
                      {Number(this.getBalance(this.context)).toLocaleString()}{' '}
                      OGN
                    </strong>{' '}
                    on {moment.utc(this.props.nextVest.date).format('L')}
                  </div>
                </div>
              )}
              <div className="form-group">
                <label htmlFor="amount">Amount of tokens to lock up</label>
                <div
                  className={`input-group ${
                    this.state.amountError ? 'is-invalid' : ''
                  }`}
                >
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
                      Max
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

            <div className="col-12 col-sm-5 pl-3 pt-4 pt-sm-4">
              <BonusGraph
                lockupAmount={Number(this.state.amount)}
                bonusRate={
                  this.props.isEarlyLockup
                    ? this.context.config.earlyLockupBonusRate
                    : this.context.config.lockupBonusRate
                }
              />
            </div>
          </div>

          <div className="actions">
            <div className="row">
              <div className="col d-none d-md-block">
                <button
                  type="button"
                  className="btn btn-outline-primary btn-lg"
                  onClick={() => this.setState({ modalState: 'Disclaimer' })}
                >
                  Back
                </button>
              </div>
              <div className="col text-center d-none d-md-block">
                <ModalStep steps={3} completedSteps={1} />
              </div>
              <div className="col text-sm-right mb-3 mb-sm-0">
                <button
                  type="submit"
                  className="btn btn-primary btn-lg"
                  disabled={!this.state.amount || this.props.lockupIsAdding}
                >
                  {this.props.lockupIsAdding ? (
                    <>Loading...</>
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
    let titleText
    if (this.props.isEarlyLockup) {
      titleText = `Special offer for ${moment
        .utc(this.props.nextVest.date)
        .format('MMMM')} vesting`
    } else {
      titleText = 'Earn Bonus Tokens'
    }
    return (
      <div className="row align-items-center mb-3 text-center text-sm-left">
        <div className="col">
          <OgnIcon
            className="mr-3 d-none d-sm-inline-block"
            style={{ marginTop: '-10px' }}
          />
          <h1 className="my-3 d-inline-block">{titleText}</h1>
        </div>
      </div>
    )
  }

  renderDisclaimer() {
    return (
      <div className="text-left">
        {this.renderTitle()}

        <hr />

        <div className="row align-items-center my-3">
          <div className="col-12 col-sm-1 mr-sm-4 text-center my-3 d-none d-sm-block">
            <YieldIcon className="mx-3" />
          </div>
          <div className="col">
            {this.props.isEarlyLockup ? (
              <>
                Earn{' '}
                <strong>{this.context.config.earlyLockupBonusRate}%</strong>{' '}
                bonus tokens immediately by locking up your{' '}
                {moment.utc(this.props.nextVest.date).format('MMMM')} vest
              </>
            ) : (
              <>
                Earn <strong>{this.context.config.lockupBonusRate}%</strong>{' '}
                bonus tokens immediately by locking up vested tokens
              </>
            )}
          </div>
        </div>

        <hr />

        <div className="row align-items-center my-3">
          <div className="col-12 col-sm-1 mr-sm-4 text-center my-3 d-none d-sm-block">
            <CalendarIcon className="mx-3" />
          </div>
          <div className="col">
            All tokens will be available for withdrawal after{' '}
            <strong>1 year</strong>
          </div>
        </div>

        <hr />

        {this.props.isEarlyLockup ? (
          <>
            <div className="row align-items-center my-3">
              <div className="col-12 col-sm-1 mr-sm-4 text-center my-3 d-none d-sm-block">
                <TokensIcon className="mx-3" />
              </div>
              <div className="col">
                <strong>
                  {Number(this.props.nextVest.amount).toLocaleString()}
                </strong>{' '}
                OGN are scheduled to vest in{' '}
                {moment.utc(this.props.nextVest.date).format('MMMM')}
              </div>
            </div>
            <hr />
            <div className="row align-items-center my-3">
              <div className="col-12 col-sm-1 mr-sm-4 text-center my-3 d-none d-sm-block">
                <ClockIcon className="mx-3" />
              </div>
              <div className="col">
                This offer expires in{' '}
                <strong>
                  {moment
                    .utc(this.context.config.earlyLockupsEnabledUntil)
                    .diff(moment(), 'days')}
                  d{' '}
                  {moment
                    .utc(this.context.config.earlyLockupsEnabledUntil)
                    .diff(moment(), 'hours') % 24}
                  h{' '}
                  {moment
                    .utc(this.context.config.earlyLockupsEnabledUntil)
                    .diff(moment(), 'minutes') % 60}
                  m
                </strong>
              </div>
            </div>
          </>
        ) : (
          <div className="row align-items-center my-3">
            <div className="col-12 col-sm-1 mr-sm-4 text-center my-3 d-none d-sm-block">
              <TokensIcon className="mx-3" />
            </div>
            <div className="col">
              This program is only available to our existing Advisor, Strategic,
              and CoinList investors. Thank you for your early support of
              Origin.
            </div>
          </div>
        )}

        <div className="actions">
          <div className="row text-center text-sm-left">
            <div className="col-12 col-sm-7 align-self-center mb-3 mb-sm-0">
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
            <div className="col-12 col-sm-5 text-sm-right mb-3 mb-sm-0">
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
