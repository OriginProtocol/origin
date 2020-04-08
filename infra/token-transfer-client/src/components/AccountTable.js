import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import moment from 'moment'

import { addAccount, deleteAccount } from '@/actions/account'
import { getError, getIsAdding, getIsLoading } from '@/reducers/account'
import { formInput, formFeedback } from '@/utils/formHelpers'
import Modal from '@/components/Modal'
import DeleteIcon from '@/assets/delete.svg'
import EthAddress from '@/components/EthAddress'
import OgnIcon from '@/assets/ogn-icon.svg'

class AccountTable extends Component {
  constructor(props) {
    super(props)
    this.state = this.getInitialState()
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

  getInitialState = () => {
    const initialState = {
      nickname: '',
      nicknameError: '',
      address: '',
      addressError: '',
      displayModal: false
    }
    return initialState
  }

  handleSubmit = async event => {
    event.preventDefault()

    const result = await this.props.addAccount({
      nickname: this.state.nickname,
      address: this.state.address
    })

    if (result.type === 'ADD_ACCOUNT_SUCCESS') {
      this.reset()
    }
  }

  handleDeleteAccount = id => {
    const result = window.confirm(
      'Are you sure you want to delete that account?'
    )
    if (result) {
      this.props.deleteAccount(id)
    }
  }

  reset = () => {
    this.setState(this.getInitialState())
  }

  render() {
    return (
      <>
        {this.state.displayModal && this.renderModal()}
        <div className="row">
          <div className="col-7">
            <h2>Ethereum Accounts</h2>
          </div>
          <div className="col-5 text-right">
            <a
              href="#"
              onClick={e => {
                e.preventDefault()
                this.setState({ displayModal: true })
              }}
            >
              Add Account
            </a>
          </div>
        </div>
        <div className="row">
          <div className="col">
            <div className="table-responsive">
              <table className="table table-borderless table-card-rows mb-4">
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
                      <td className="table-empty-cell" colSpan="100%">
                        You haven&apos;t added any Ethereum accounts.
                      </td>
                    </tr>
                  ) : (
                    this.props.accounts.map(account => (
                      <tr key={account.address}>
                        <td>
                          <strong>{account.nickname}</strong>
                        </td>
                        <td className="d-none d-lg-block">{account.address}</td>
                        <td className="d-lg-none">
                          <EthAddress address={account.address} />
                        </td>
                        <td>{moment(account.createdAt).format('L')}</td>
                        <td className="text-right">
                          <DeleteIcon
                            style={{ fill: '#8fa7b7', cursor: 'pointer' }}
                            onClick={() => this.handleDeleteAccount(account.id)}
                          />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </>
    )
  }

  renderModal() {
    const input = formInput(this.state, state => this.setState(state))
    const Feedback = formFeedback(this.state)

    return (
      <Modal appendToId="private" onClose={this.reset} closeBtn={true}>
        <div className="row align-items-center mb-3 text-center text-sm-left">
          <div className="col">
            <OgnIcon
              className="mr-3 d-none d-sm-inline-block"
              style={{ marginTop: '-10px' }}
            />
            <h1 className="my-3">Add an account</h1>
          </div>
        </div>
        <hr />
        <form onSubmit={this.handleSubmit}>
          <div className="row">
            <div className="col-12 col-sm-8 offset-sm-2">
              <div className="form-group">
                <label htmlFor="email">Nickname</label>
                <input {...input('nickname')} />
                {Feedback('nickname')}
              </div>
              <div className="form-group">
                <label htmlFor="email">Ethereum Address</label>
                <input {...input('address')} />
                {Feedback('address')}
              </div>
            </div>
          </div>
          <div className="actions mt-5">
            <div className="row mb-3 mb-sm-0">
              <div className="col text-left d-none d-md-block">
                <button
                  type="button"
                  className="btn btn-outline-primary btn-lg"
                  onClick={event => {
                    event.preventDefault()
                    this.setState({ displayModal: false })
                  }}
                >
                  Cancel
                </button>
              </div>
              <div className="col text-right">
                <button
                  type="submit"
                  className="btn btn-primary btn-lg"
                  disabled={
                    !this.state.nickname ||
                    !this.state.address ||
                    this.props.isAdding
                  }
                >
                  {this.props.isAdding ? <>Loading...</> : <span>Add</span>}
                </button>
              </div>
            </div>
          </div>
        </form>
      </Modal>
    )
  }
}

const mapStateToProps = ({ account }) => {
  return {
    isAdding: getIsAdding(account),
    isLoading: getIsLoading(account),
    error: getError(account)
  }
}

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      addAccount: addAccount,
      deleteAccount: deleteAccount
    },
    dispatch
  )

export default connect(mapStateToProps, mapDispatchToProps)(AccountTable)
