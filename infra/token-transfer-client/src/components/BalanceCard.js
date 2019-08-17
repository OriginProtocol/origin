import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import get from 'lodash.get'

import { addAccount, fetchAccounts } from '@/actions/account'
import { formInput, formFeedback } from '@/utils/formHelpers'
import BorderedCard from '@/components/BorderedCard'
import Modal from '@/components/Modal'

class BalanceCard extends Component {
  constructor(props) {
    super(props)
    this.state = {
      address: '',
      addressError: '',
      canChooseExisting: false,
      displayModal: false,
      loading: false,
      modalAddAccount: false,
      modalState: 'Disclaimer',
      nickname: '',
      nicknameError: ''
    }
  }

  componentDidMount() {
    this.props.fetchAccounts()
  }

  componentDidUpdate(prevProps) {
    // TODO: remove duplicate server error parsing code

    // Parse server errors for account add
    if (get(prevProps, 'account.error') !== this.props.account.error) {
      if (this.props.account.error && this.props.account.error.status === 422) {
        // Parse validation errors from API
        this.props.account.error.response.body.errors.forEach(e => {
          this.setState({ [`${e.param}Error`]: e.msg })
        })
      }
    }

    // Parse server errors for transfer add
    if (get(prevProps, 'account.error') !== this.props.account.error) {
      if (this.props.account.error && this.props.account.error.status === 422) {
        // Parse validation errors from API
        this.props.account.error.response.body.errors.forEach(e => {
          this.setState({ [`${e.param}Error`]: e.msg })
        })
      }
    }

    // If there are no accounts, then set the withdraw form to add an account
    // to the account address book, otherwise default to selecting one
    if (get(prevProps, 'account.accounts') !== this.props.account.accounts) {
      if (this.props.account.accounts.length === 0) {
        this.setState({ modalAddAccount: true })
      } else {
        this.setState({ canChooseExisting: false })
      }
    }
  }

  isLoading = () => {
    return this.props.account.isFetching
  }

  handleTransfer = async (event) => {
    event.preventDefault()

    if (this.state.modalAddAccount) {
      // Add account before processing request
      await this.props.addAccount({
        nickname: this.state.nickname,
        address: this.state.address
      })
    }

    // TODO do transfer
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
          <div className="balance">
            {Number(this.props.balance).toLocaleString()}{' '}
            <span className="ogn">OGN</span>
          </div>
          <div>
            <button
              className="btn btn-secondary btn-lg"
              onClick={() => this.setState({ displayModal: true })}
            >
              Withdraw
            </button>
          </div>
          <small>You will need an Ethereum wallet to withdraw OGN</small>
        </BorderedCard>
      </>
    )
  }

  renderModal() {
    const input = formInput(this.state, state => this.setState(state))
    const Feedback = formFeedback(this.state)

    return (
      <Modal
        appendToId="main"
        onClose={() => this.setState({ displayModal: false })}
        closeBtn={true}
      >
        <h1 className="mb-2">Withdraw OGN</h1>
        {this.state.modalState === 'Disclaimer' && (
          <>
            <div className="alert alert-warning mt-4 mb-4 mx-auto">
              This transaction is not reversible and we cannot help you recover
              these funds
            </div>
            <ul className="my-4 mx-auto">
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
                Aenean justo tellus, vestibulum sit amet pharetra id, ultricies
                ut neque.
              </li>
            </ul>
            <button
              className="btn btn-primary btn-lg mt-3"
              onClick={() => this.setState({ modalState: 'Form' })}
            >
              Continue
            </button>
          </>
        )}
        {this.state.modalState === 'Form' && (
          <form onSubmit={this.handleTransfer}>
            <div className="form-group">
              <label htmlFor="email">Amount of Tokens</label>
              <div className="input-group">
                <input {...input('amount')} />
                <div className="input-group-append">
                  <span className="badge badge-secondary">OGN</span>
                </div>
              </div>
              {Feedback('amount')}
            </div>
            {this.props.account.accounts.length > 0 &&
            !this.state.modalAddAccount ? (
              <>
                <div className="form-group">
                  <label htmlFor="email">Destination Account</label>
                  <select className="custom-select custom-select-lg">
                    {this.props.account.accounts.map(account => (
                      <option key={account.address} value={account.address}>
                        {account.nickname}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <a
                    href="#"
                    onClick={() => this.setState({ modalAddAccount: true })}
                  >
                    Add Another Account
                  </a>
                </div>
              </>
            ) : (
              <>
                <div className="form-group">
                  <label htmlFor="email">Destination Account</label>
                  <input {...input('address')} placeholder="0x..." />
                  {Feedback('address')}
                </div>
                <div className="form-group">
                  <label htmlFor="email">Destination Account Nickname</label>
                  <input {...input('nickname')} />
                  {Feedback('nickname')}
                </div>
                {this.state.canChooseExisting && (
                  <div className="form-group">
                    <a
                      href="#"
                      onClick={() => this.setState({ modalAddAccount: false })}
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
              disabled={this.state.loading}
            >
              Continue
            </button>
          </form>
        )}
      </Modal>
    )
  }
}

const mapStateToProps = ({ account }) => {
  return { account }
}

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      addAccount: addAccount,
      fetchAccounts: fetchAccounts
    },
    dispatch
  )

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(BalanceCard)

require('react-styl')(`
  .balance
    font-size: 40px
    font-weight: bold;
  .ogn
    font-size: 20px
    color: #007cff
  .alert
    width: 80%
  ul
    text-align: left
    width: 90%
`)
