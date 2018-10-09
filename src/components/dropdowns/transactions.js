import React, { Component } from 'react'
import { FormattedMessage } from 'react-intl'
import { connect } from 'react-redux'
import $ from 'jquery'

import Transaction from '../transaction'

const CONFIRMATION_COMPLETION_COUNT = 12

class TransactionsDropdown extends Component {
  constructor(props) {
    super(props)

    this.handleClick = this.handleClick.bind(this)

    this.state = {
      hideList: []
    }
  }

  componentDidMount() {
    // control hiding of dropdown menu
    $('.transactions.dropdown').on('hide.bs.dropdown', function({ clickEvent }) {
      // if triggered by data-toggle
      if (!clickEvent) {
        return true
      }
      // otherwise only if triggered by self or another dropdown
      const el = $(clickEvent.target)

      return el.hasClass('dropdown') && el.hasClass('nav-item')
    })
  }

  componentDidUpdate(prevProps) {
    const { transactions } = this.props
    const dropdownHidden = !$('.transactions.dropdown').hasClass('show')

    // intrusively open the dropdown when a new transaction is being confirmed
    if (transactions.length > prevProps.transactions.length && dropdownHidden) {
      $('#transactionsDropdown').dropdown('toggle')
    }
  }

  handleClick() {
    this.setState({
      hideList: this.props.transactions.map(
        ({ confirmationCount, transactionHash }) => {
          return confirmationCount >= CONFIRMATION_COMPLETION_COUNT
            ? transactionHash
            : false
        }
      )
    })
  }

  render() {
    const { transactions } = this.props
    const { hideList } = this.state
    const transactionsNotHidden = transactions.filter(
      t => !hideList.includes(t.transactionHash)
    )
    const transactionsNotCompleted = transactions.filter(
      t => t.confirmationCount < CONFIRMATION_COMPLETION_COUNT
    )
    const transactionsCanBeCleared = !!transactionsNotHidden.filter(
      t => t.confirmationCount >= CONFIRMATION_COMPLETION_COUNT
    ).length

    return (
      <div className="nav-item transactions dropdown">
        <a
          className="nav-link active dropdown-toggle"
          id="transactionsDropdown"
          role="button"
          data-toggle="dropdown"
          aria-haspopup="true"
          aria-expanded="false"
          ga-category="top_nav"
          ga-label="transactions"
        >
          <img
            src="images/arrows-light.svg"
            className="transactions"
            alt="Blockchain transactions"
          />
          <img
            src="images/arrows-dark.svg"
            className="transactions selected"
            alt="Blockchain transactions"
          />
          {!!transactions.filter(
            ({ confirmationCount }) =>
              !confirmationCount ||
              confirmationCount < CONFIRMATION_COMPLETION_COUNT
          ).length && (
            <div className="arrows-container">
              <img
                src="images/blue-circle-arrows.svg"
                className="rotating-arrows"
                alt="rotating circular arrows"
              />
            </div>
          )}
        </a>
        <div
          className="dropdown-menu dropdown-menu-right"
          aria-labelledby="transactionsDropdown"
        >
          <div className="triangle-container d-flex justify-content-end">
            <div className="triangle" />
          </div>
          <div className="actual-menu">
            <header className="d-flex">
              <div className="count">
                <div className="d-inline-block">
                  {transactionsNotCompleted.length}
                </div>
              </div>
              <h3 className="mr-auto">
                <span className="d-none d-md-inline">
                  {transactionsNotCompleted.length !== 1 && (
                    <FormattedMessage
                      id={'transactions.pendingBlockchainTransactionsHeading'}
                      defaultMessage={'Pending Blockchain Transactions'}
                    />
                  )}
                  {transactionsNotCompleted.length === 1 && (
                    <FormattedMessage
                      id={'transactions.pendingBlockchainTransactionHeading'}
                      defaultMessage={'Pending Blockchain Transaction'}
                    />
                  )}
                </span>
                <span className="d-none d-sm-inline d-md-none">
                  <FormattedMessage
                    id={'transactions.blockchainTransactionsHeading'}
                    defaultMessage={'Blockchain Transactions'}
                  />
                </span>
                <span className="d-inline d-sm-none">
                  <FormattedMessage
                    id={'transactions.transactionsHeading'}
                    defaultMessage={'Transactions'}
                  />
                </span>
              </h3>
              <div className="button-container">
                {!transactionsCanBeCleared && (
                  <button
                    className="btn btn-clear"
                    onClick={this.handleClick}
                    disabled
                  >
                    <FormattedMessage
                      id={'transactions.clear'}
                      defaultMessage={'Clear'}
                    />
                  </button>
                )}
                {transactionsCanBeCleared && (
                  <button className="btn btn-clear" onClick={this.handleClick}>
                    <FormattedMessage
                      id={'transactions.clear'}
                      defaultMessage={'Clear'}
                    />
                  </button>
                )}
              </div>
            </header>
            <div className="transactions-list">
              <ul className="list-group">
                {transactionsNotHidden.map(transaction => (
                  <Transaction
                    key={transaction.transactionHash}
                    transaction={transaction}
                    confirmationCompletionCount={CONFIRMATION_COMPLETION_COUNT}
                  />
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

const mapStateToProps = state => {
  return {
    transactions: state.transactions
  }
}

export default connect(mapStateToProps)(TransactionsDropdown)
