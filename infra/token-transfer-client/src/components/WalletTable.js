import React, { Component } from 'react'

import { formInput, formFeedback } from '../utils/formHelpers'
import agent from '../utils/agent'
import Modal from './Modal'

export default class WalletTable extends Component {
  constructor(props) {
    super(props)
    this.state = {
      accounts: [],
      nickName: '',
      ethAddress: '',
      displayAddWalletModal: false
    }
  }

  componentDidMount() {
  }

  handleAddAccount = async () => {
    this.setState({ loadingAddAccount: true })
    let response
    try {
      const apiUrl = process.env.PORTAL_API_URL || 'http://localhost:5000'
      response = await agent.post(`${apiUrl}/accounts`)
        .send({
          nickName: this.state.nickName,
          ethAddress: this.state.ethAddress
        })
    } catch (error) {
      this.setState({ addAccountError: error })
      return
    }
    this.setState({ accounts: [...this.state.accounts, response.body] })
    this.setState({ loadingAddAccount: false })
  }

  handleEditAccount() {
  }

  handleDeleteAccount() {
  }

  render() {
    return (
      <>
        {this.state.displayAddWalletModal && this.renderAddWalletModal()}
        <div className="row">
          <div className="col">
            <h2>Ethereum Accounts</h2>
          </div>
          <div className="col text-right">
            <a
              href="#"
              onClick={e => {
                e.preventDefault()
                this.setState({ displayAddWalletModal: true })
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
                <tr>
                  {this.state.accounts.length === 0 ? (
                    <td className="table-empty-cell" colSpan="4">
                      You don&apos;t have any accounts
                    </td>
                  ) : (
                    this.state.accounts.map(account => (
                      <>
                        <td>{account.nickname}</td>
                        <td>{account.ethAddress}</td>
                        <td>{account.createdAt}</td>
                        <td><a href="#">e</a> <a href="#">x</a></td>
                      </>
                    ))
                  )}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </>
    )
  }

  renderAddWalletModal() {
    const input = formInput(this.state, state => this.setState(state))
    const Feedback = formFeedback(this.state)

    return (
      <Modal appendToId="main">
        <h1 className="mb-2">Add An Account</h1>
        <p>Enter a nickname and an ETH address</p>
        <div className="form-group">
          <label htmlFor="email">Nickname</label>
          <input {...input('nickname')} />
          {Feedback('nickname')}
        </div>
        <div className="form-group">
          <label htmlFor="email">ETH Address</label>
          <input {...input('ethAddress')} />
          {Feedback('ethAddress')}
        </div>
        <button
          className="btn btn-primary btn-lg mt-5"
          onClick={this.handleAddAccount}
        >
          Add
        </button>
      </Modal>
    )
  }
}

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
