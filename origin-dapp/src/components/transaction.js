import React, { Component } from 'react'
import { FormattedMessage } from 'react-intl'
import moment from 'moment-timezone'

import TransactionMessage from 'components/transaction-message'

import { getListing } from 'utils/listing'

class Transaction extends Component {
  constructor(props) {
    super(props)

    this.state = {
      listing: null
    }
  }

  async componentDidMount() {
    try {
      const { transaction } = this.props
      let { listing } = transaction
      const { listingId } = transaction

      if (!listing && listingId) {
        listing = await getListing(listingId)
      }

      this.setState({ listing })
    } catch (e) {
      console.error(e)
    }
  }

  render() {
    const transactionTypeKeysWithoutListing = ['updateProfile']
    const { confirmationCompletionCount, transaction } = this.props
    const { listing } = this.state
    const {
      confirmationCount,
      timestamp,
      transactionHash,
      transactionTypeKey
    } = transaction
    const created = timestamp

    if (
      !listing &&
      !transactionTypeKeysWithoutListing.includes(transactionTypeKey)
    ) {
      return null
    }

    const completed = confirmationCount >= confirmationCompletionCount
    const decimal = confirmationCount / confirmationCompletionCount
    const percentage = Math.min(100, (decimal * 100).toFixed())
    const degreeIncrement = 360 / confirmationCompletionCount
    // The block timestamp is somehow in the future when testing locally. - Micah
    const timeReference = Math.min(created * 1000, Date.now())

    return (
      <li
        key={transactionHash}
        className="list-group-item d-flex align-items-stretch transaction"
      >
        <div className="text-container">
          <div className="d-flex">
            <div className="message">
              <TransactionMessage
                type={transactionTypeKey}
                className="text-truncate"
              />
            </div>
            <div className="timelapse ml-auto">
              {moment(timeReference).fromNow()}
            </div>
          </div>
          <div className="d-flex">
            <div className="addresses text-truncate">{transactionHash}</div>
            <div className="confirmations-count ml-auto">
              {percentage}% &nbsp;
              <FormattedMessage
                id={'transactions.completed'}
                defaultMessage={'Completed'}
              />
            </div>
          </div>
        </div>
        <div className="graphic-container">
          {!completed && (
            <div className="outer-circle">
              {Array(confirmationCompletionCount)
                .fill()
                .map((e, i) => {
                  const confirmed = confirmationCount > i
                  const degrees = degreeIncrement * i

                  return (
                    <div
                      key={`slice-${i}`}
                      className={`slice${confirmed ? ' confirmed' : ''}`}
                      style={{ transform: `rotate(${degrees}deg)` }}
                    >
                      <div
                        className="crust"
                        style={{ transform: `rotate(${degreeIncrement}deg)` }}
                      />
                    </div>
                  )
                })}
              <div className="inner-circle">
                <img
                  src="images/blue-circle-arrows.svg"
                  className="rotating-arrows"
                  alt="rotating circular arrows"
                />
              </div>
            </div>
          )}
          {completed && <div className="completed-circle" />}
        </div>
      </li>
    )
  }
}

export default Transaction
