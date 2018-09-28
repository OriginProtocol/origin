import React, { Component } from 'react'
import { FormattedMessage } from 'react-intl'
import { connect } from 'react-redux'
import moment from 'moment'

import TransactionMessage from 'components/transaction-message'

import { getListing } from 'utils/listing'

import origin from '../services/origin'

class Transaction extends Component {
  constructor(props) {
    super(props)

    this.state = {
      listing: null,
      purchase: null
    }
  }

  async componentDidMount() {
    try {
      let { offer, listing } = this.props.transaction
      const { offerId, listingId } = this.props.transaction

      offer =
        offer || (offerId ? await origin.marketplace.getOffer(offerId) : null)
      const purchase = offer

      if (!listing && listingId) {
        listing = await getListing(listingId)
      }

      this.setState({ listing, purchase })
    } catch (e) {
      console.error(e)
    }
  }

  render() {
    const { confirmationCompletionCount, transaction, web3Account } = this.props
    const { listing, purchase } = this.state
    const {
      confirmationCount,
      timestamp,
      transactionHash,
      transactionTypeKey
    } = transaction
    const created = timestamp

    if (!listing) {
      return null
    }

    const { buyer } = purchase || {}
    const { seller } = listing
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

const mapStateToProps = state => {
  return {
    web3Account: state.app.web3.account
  }
}

export default connect(mapStateToProps)(Transaction)
