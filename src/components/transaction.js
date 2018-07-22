import React, { Component, Fragment } from 'react'
import { FormattedMessage } from 'react-intl'

import moment from 'moment'

import TransactionMessage from './transaction-message'

import origin from '../services/origin'

class Transaction extends Component {
  constructor(props){
    super(props)

    this.state = {
      listing: null,
      purchase: null,
    }
  }

  // To Do: support non-purchase transactions
  async componentDidMount() {
    try {
      const purchaseAddress = this.props.transaction.events.ListingPurchased.returnValues[0]
      const purchase = await origin.purchases.get(purchaseAddress)
      const listing = await origin.listings.get(purchase.listingAddress)

      this.setState({ listing, purchase })
    } catch(e) {
      console.error(e)
    }
  }

  render() {
    const { confirmationCompletionCount, transaction } = this.props
    const { listing, purchase } = this.state
    const { transactionHash, confirmationCount } = transaction

    if (!listing || !purchase) {
      return null
    }

    const fromAddress = purchase.buyerAddress
    const toAddress = listing.sellerAddress
    const truncatedFrom = `${fromAddress.slice(0, 4)}...${fromAddress.slice(38)}`
    const truncatedTo = `${toAddress.slice(0, 4)}...${toAddress.slice(38)}`
    const completed = confirmationCount >= confirmationCompletionCount
    const decimal = confirmationCount / confirmationCompletionCount
    const percentage = Math.min(100, (decimal * 100).toFixed())
    const degreeIncrement = 360 / confirmationCompletionCount

    return (
      <li key={transactionHash} className="list-group-item d-flex align-items-stretch transaction">
        <div className="text-container">
          <div className="d-flex">
            <div className="message">
              <TransactionMessage
                type="purchased"
                className="text-truncate"
              />
            </div>
            <div className="timelapse ml-auto">
              { moment(purchase.created * 1000).fromNow() }
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
              {percentage}%
              &nbsp;
              <FormattedMessage
                id={ 'transactions.completed' }
                defaultMessage={ 'Completed' }
              />
            </div>
          </div>
        </div>
        <div className="graphic-container">
            <div className="outer-circle">
              {Array(confirmationCompletionCount).fill().map((e, i) => {
                const confirmed = confirmationCount > i
                const degrees = degreeIncrement * i

                return (
                  <div key={`slice-${i}`} className={`slice${confirmed ? ' confirmed' : ''}`} style={{ transform: `rotate(${degrees}deg)` }}>
                    <div className="crust" style={{ transform: `rotate(${degreeIncrement}deg)` }}></div>
                  </div>
                )
              })}
              <div className="inner-circle">
                <img src="images/blue-circle-arrows.svg" className="rotating-arrows" alt="rotating circular arrows" />
              </div>
            </div>
        </div>
      </li>
    )
  }
}

export default Transaction
