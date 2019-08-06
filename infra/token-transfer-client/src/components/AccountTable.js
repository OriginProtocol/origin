import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import { addAccount } from '../actions/account'
import { formInput, formFeedback } from '../utils/formHelpers'
import Modal from './Modal'

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
    if (prevProps.error !== this.props.error) {
      if (this.props.error && this.props.error.status === 422) {
        // Parse validation errors from API
        this.props.error.response.body.errors.forEach(e => {
          this.setState({ [`${e.param}Error`]: e.msg })
        })
      }
    }
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
                  <th>Account Nickname</th>
                  <th>Account Address</th>
                  <th>Date Created</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {this.props.accounts.length === 0 ? (
                  <tr>
                    <td className="table-empty-cell" colSpan="4">
                      You don&apos;t have any accounts
                    </td>
                  </tr>
                ) : (
                  this.props.accounts.map(account => (
                    <tr key={account.address}>
                      <td>{account.nickname}</td>
                      <td>{account.address}</td>
                      <td>{account.createdAt}</td>
                      <td>
                        <a href="#">e</a>
                        <a href="#">x</a>
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
          className="btn btn-primary btn-lg mt-5"
          onClick={() =>
            this.props.addAccount({
              nickname: this.state.nickname,
              address: this.state.address
            })
          }
          disabled={this.props.isAdding}
        >
          Add
        </button>
      </Modal>
    )
  }
}

const mapStateToProps = ({ account }) => {
  return {
    accounts: account.accounts,
    error: account.error
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

require('react-styl')(`
  .table
    font-size: 14px
    th
      font-weight: normal
      color: #638298
      border-top: 0
      border-bottom: 1px solid #bdcbd5 !important
    th, td
      padding: 1rem 0
    td.table-empty-cell
      color: #638298
`)
