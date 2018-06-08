import React, { Component } from 'react'
import { FormattedMessage } from 'react-intl'
import { Link } from 'react-router-dom'
import $ from 'jquery'

import Timelapse from '../timelapse'
import data from '../../data'

const CONFIRMATION_COMPLETION_COUNT = 6

class TransactionsDropdown extends Component {
  constructor(props) {
    super(props)

    this.handleClick = this.handleClick.bind(this)
    this.handleSimulation = this.handleSimulation.bind(this)
    this.state = {
      confirmations: [0, 2, 4, 6],
      hideList: [],
      simulationStarted: false,
    }
  }

  componentDidMount() {
    $(document).on('click', '.transactions .dropdown-menu', function(e) {
      e.stopPropagation()
    })
  }

  handleClick(e) {
    this.setState({ hideList: this.state.confirmations.map((int, i) => int > (CONFIRMATION_COMPLETION_COUNT - 1) ? i : false) })
  }

  handleSimulation() {
    if (!this.state.simulationStarted) {
      // simulate blockchain confirmation progress
      setInterval(() => {
        const i = Math.floor(Math.random() * (data.transactions.length - 1))
        let confirmations = [...this.state.confirmations]

        if (confirmations[i] < CONFIRMATION_COMPLETION_COUNT) {
          confirmations[i] += 1

          this.setState({ confirmations })
        }
      }, 1000)

      this.setState({ simulationStarted: true })
    }
  }

  render() {
    const { confirmations, hideList } = this.state
    const notHiddenTransactions = data.transactions.filter((t, i) => !hideList.includes(i))
    const notCompletedTransactions = confirmations.filter(int => int < CONFIRMATION_COMPLETION_COUNT)
    const transactionsCanBeCleared = !!notHiddenTransactions.length

    return (
      <div className="nav-item transactions dropdown">
        <a className="nav-link active dropdown-toggle"
          id="transactionsDropdown"
          role="button"
          data-toggle="dropdown"
          aria-haspopup="true"
          aria-expanded="false"
          onClick={this.handleSimulation}
        >
          <img src="images/arrows-light.svg" className="transactions" alt="Blockchain transactions" />
          <img src="images/arrows-dark.svg" className="transactions selected" alt="Blockchain transactions" />
          {confirmations.filter(int => int > (CONFIRMATION_COMPLETION_COUNT - 1)).length < confirmations.length &&
            <div className="arrows-container">
              <img src="images/blue-circle-arrows.svg" className="rotating-arrows" alt="rotating circular arrows" />
            </div>
          }
        </a>
        <div className="dropdown-menu dropdown-menu-right" aria-labelledby="transactionsDropdown">
          <div className="triangle-container d-flex justify-content-end"><div className="triangle"></div></div>
          <div className="actual-menu">
            <header className="d-flex">
              <div className="count">
                <div className="d-inline-block">{notCompletedTransactions.length}</div>
              </div>
              <h3 className="mr-auto">
                <span className="d-none d-md-inline">
                  <FormattedMessage
                    id={ 'transactions.pendingTransactions' }
                    defaultMessage={ 'Pending Blockchain Transactions' }
                  />
                  &nbsp;
                </span>
              </h3>
              <div className="button-container">
                {!transactionsCanBeCleared &&
                  <button className="btn btn-clear" onClick={this.handleClick} disabled>
                    <FormattedMessage
                      id={ 'transactions.clear' }
                      defaultMessage={ 'Clear' }
                    />
                  </button>
                }
                {transactionsCanBeCleared &&
                  <button className="btn btn-clear" onClick={this.handleClick}>
                    <FormattedMessage
                      id={ 'transactions.clear' }
                      defaultMessage={ 'Clear' }
                    />
                  </button>
                }
              </div>
            </header>
            <div className="transactions-list">
              <ul className="list-group">
                {notHiddenTransactions.map((t, i) => {
                  const confirmationsCount = confirmations[i]
                  const truncatedFrom = `${t.from.slice(0, 4)}...${t.from.slice(38)}`
                  const truncatedTo = `${t.to.slice(0, 4)}...${t.to.slice(38)}`
                  const completed = confirmationsCount > (CONFIRMATION_COMPLETION_COUNT - 1)
                  const percentage = `${(confirmationsCount / CONFIRMATION_COMPLETION_COUNT * 100).toFixed()}%`

                  return (
                    <li key={`transaction-${+t.createdAt}`} className="list-group-item d-flex align-items-stretch transaction">
                      <div className="text-container">
                        <div className="d-flex">
                          <div className="message">
                            {t.message}
                          </div>
                          <div className="timelapse ml-auto">
                            <Timelapse abbreviated={true} reactive={true} reference={t.createdAt} />
                          </div>
                        </div>
                        <div className="d-flex">
                          <div className="addresses">
                            <FormattedMessage
                              id={ 'transactions.from' }
                              defaultMessage={ 'From' }
                            />
                            &nbsp;
                            {truncatedFrom}
                            &nbsp;
                            <img src="images/arrow-dark.svg" />
                            &nbsp;
                            <FormattedMessage
                              id={ 'transactions.to' }
                              defaultMessage={ 'To' }
                            />
                            &nbsp;
                            {truncatedTo}
                          </div>
                          <div className="confirmations-count ml-auto">
                            {percentage}
                            &nbsp;
                            <FormattedMessage
                              id={ 'transactions.completed' }
                              defaultMessage={ 'Completed' }
                            />
                          </div>
                        </div>
                      </div>
                      <div className="graphic-container">
                        {!completed &&
                          <div className="outer-circle">
                            {Array(CONFIRMATION_COMPLETION_COUNT).fill().map((e, i) => (
                              <div key={`slice-${i}`} className={`slice${confirmationsCount > i ? ' confirmed' : ''}`}>
                                <div className="crust"></div>
                              </div>
                            ))}
                            <div className="inner-circle">
                              <img src="images/blue-circle-arrows.svg" className="rotating-arrows" alt="rotating circular arrows" />
                            </div>
                          </div>
                        }
                        {completed &&
                          <div className="completed-circle"></div>
                        }
                      </div>
                    </li>
                  )
                })}
              </ul>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default TransactionsDropdown
