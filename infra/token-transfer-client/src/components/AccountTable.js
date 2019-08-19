import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import moment from 'moment'

import { addAccount } from '@/actions/account'
import { getAccounts, getError, getIsLoading } from '@/reducers/account'
import { formInput, formFeedback } from '@/utils/formHelpers'
import Modal from '@/components/Modal'
import DeleteIcon from '@material-ui/icons/Delete'

class AccountTable extends Component {
  constructor(props) {
    super(props)
    this.state = {
      nickname: '',
      nicknameError: '',
      address: '',
      addressError: '',
      displayModal: false
    }
  }

  componentDidUpdate(prevProps) {
    // Parse server errors
    if (prevProps.error !== this.props.error) {
      if (this.props.error && this.props.error.status === 422) {
        // Parse validation errors from API
        this.props.error.response.body.errors.forEach(e => {
          this.setState({ [`${e.param}Error`]: e.msg })
        })
      }
    }
  }

  handleSubmit = event => {
    event.preventDefault()

    this.props.addAccount({
      nickname: this.state.nickname,
      address: this.state.address
    })
  }

  render() {
    return (
      <>
        {this.state.displayModal && this.renderModal()}
        <div className="row">
          <div className="col">
            <h2>Ethereum Accounts</h2>
          </div>
          <div className="col text-right">
            <a
              href="#"
              onClick={e => {
                e.preventDefault()
                this.setState({ displayModal: true })
              }}
            >
              + Add an Account
            </a>
          </div>
        </div>
        <div className="row">
          <div className="col">
            <table className="table mt-4 mb-4">
              <thead>
                <tr>
                  <th>Nickname</th>
                  <th>Address</th>
                  <th>Created</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {this.props.accounts.length === 0 ? (
                  <tr>
                    <td className="table-empty-cell" colSpan="100%">
                      You don&apos;t have any accounts
                    </td>
                  </tr>
                ) : (
                  this.props.accounts.map(account => (
                    <tr key={account.address}>
                      <td>{account.nickname}</td>
                      <td>{account.address}</td>
                      <td>{moment(account.createdAt).format('L')}</td>
                      <td>
                        <DeleteIcon style={{ fill: '#8fa7b7' }} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
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
        <h1 className="mb-2">Add An Account</h1>
        <p>Enter a nickname and an ETH address</p>
        <form onSubmit={this.handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Nickname</label>
            <input {...input('nickname')} />
            {Feedback('nickname')}
          </div>
          <div className="form-group">
            <label htmlFor="email">ETH Address</label>
            <input {...input('address')} />
            {Feedback('address')}
          </div>
          <button
            type="submit"
            className="btn btn-primary btn-lg mt-5"
            disabled={this.props.isLoading}
          >
            {this.props.isLoading ? (
              <>
                <span className="spinner-grow spinner-grow-sm"></span>
                Loading...
              </>
            ) : (
              <span>Add</span>
            )}
          </button>
        </form>
      </Modal>
    )
  }
}

const mapStateToProps = ({ account }) => {
  return {
    accounts: getAccounts(account),
    error: getError(account),
    isLoading: getIsLoading(account)
  }
}

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      addAccount: addAccount
    },
    dispatch
  )

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AccountTable)
