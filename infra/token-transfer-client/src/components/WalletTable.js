import React, { Component } from 'react'

import Modal from './Modal'

export default class WalletTable extends Component {
  constructor(props) {
    super(props)
    this.state = {
      accounts: [],
      displayAddWalletModal: false
    }
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
                    <>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                    </>
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
    return (
      <Modal appendToId="main">
        <h1>Add Wallet</h1>
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
