import React, { Component } from 'react'
import { FormattedMessage, defineMessages, injectIntl } from 'react-intl'
import origin from '../services/origin'
import moment from 'moment'

class OfferDetail extends Component {
  constructor(props) {
    super(props)

    this.intlMessages = defineMessages({
      pricePerUnit: {
        id: 'offer-detail.pricePerUnit',
        defaultMessage: 'Price / unit'
      },
      quantity: {
        id: 'offer-detail.quantity',
        defaultMessage: 'Quantity'
      },
      totalPrice: {
        id: 'offer-detail.totalPrice',
        defaultMessage: 'Total Price'
      },
      offerDate: {
        id: 'offer-detail.offerDate',
        defaultMessage: 'Offer Date'
      },
      offerNumber: {
        id: 'offer-detail.offerNumber',
        defaultMessage: 'Offer Number'
      },
      paymentStatus: {
        id: 'offer-detail.paymentStatus',
        defaultMessage: 'Payment Status'
      },
      inEscrow: {
        id: 'offer-detail.paymentStatus.inEscrow',
        defaultMessage: 'In Escrow'
      },
      releasedToSeller: {
        id: 'offer-detail.paymentStatus.releasedToSeller',
        defaultMessage: 'Released to Seller'
      },
      refundedToBuyer: {
        id: 'offer-detail.paymentStatus.refundedToBuyer',
        defaultMessage: 'Refunded to Buyer'
      },
      fundsLost: {
        id: 'offer-detail.paymentStatus.fundsLost',
        defaultMessage: 'Funds lost irrevocably'
      },
      unknown: {
        id: 'offer-detail.paymentStatus.unknown',
        defaultMessage: 'Unknown'
      },
      startDate: {
        id: 'offer-detail.startDate',
        defaultMessage: 'Start Date'
      },
      endDate: {
        id: 'offer-detail.endDate',
        defaultMessage: 'End Date'
      }
    })
  }

  getPaymentStatus(offerStatus) {
    if (['created', 'accepted', 'disputed'].includes(offerStatus))
      return this.props.intl.formatMessage(this.intlMessages.inEscrow)
    else if (['finalized', 'sellerReviewed'].includes(offerStatus))
      return this.props.intl.formatMessage(this.intlMessages.releasedToSeller)
    else if (['withdrawn'].includes(offerStatus))
      return this.props.intl.formatMessage(this.intlMessages.refundedToBuyer)
    //TODO: figure out how to get the outcome of the ruling
    else if (['ruling'].includes(offerStatus))
      return this.props.intl.formatMessage(this.intlMessages.unknown)
    else if (['error'].includes(offerStatus))
      return this.props.intl.formatMessage(this.intlMessages.fundsLost)
    else {
      console.log(`Unknown offer status: ${offerStatus}`)
      return this.props.intl.formatMessage(this.intlMessages.unknown)
    }
  }

  render() {
    const {
      listing,
      offer
    } = this.props

    const {
      price,
      priceCurrency,
      isMultiUnit,
      isFractional
    } = listing

    const {
      id,
      unitsPurchased,
      totalPrice,
      status,
      createdAt
    } = offer

    let properties = [
      {
        icon: 'images/total-price-icon.svg',
        iconAlt: 'total price icon',
        labelId: 'totalPrice',
        value: `${Number(totalPrice.amount).toLocaleString(undefined,
                  { minimumFractionDigits: 5, maximumFractionDigits: 5 }
                )} ${priceCurrency}`
      },
      {
        icon: 'images/offer-number-icon.svg',
        iconAlt: 'offer number icon',
        labelId: 'offerNumber',
        value: id
      },
      {
        icon: 'images/payment-status-icon.svg',
        iconAlt: 'payment status icon',
        labelId: 'paymentStatus',
        value: this.getPaymentStatus(status)
      },
      {
        icon: 'images/offer-date-icon.svg',
        iconAlt: 'offer date icon',
        labelId: 'offerDate',
        value: moment(createdAt * 1000).format('MMM. D, YYYY')
      }
    ]

    if (isMultiUnit) {
      properties = [
        {
          icon: 'images/price-unit-icon.svg',
          iconAlt: 'price per unit icon',
          labelId: 'pricePerUnit',
          value: `${Number(price).toLocaleString(undefined,
                    { minimumFractionDigits: 5, maximumFractionDigits: 5 }
                  )} ${priceCurrency}`
        },
        {
          icon: 'images/quantity-icon.svg',
          iconAlt: 'quantity icon',
          labelId: 'quantity',
          value: unitsPurchased
        }
      ].concat(properties)
    }

    if (isFractional) {
      properties = properties.concat([
        {
          icon: 'images/start-date-icon.svg',
          iconAlt: 'start date icon',
          labelId: 'startDate',
          value: 'TODO'
        },
        {
          icon: 'images/end-date-icon.svg',
          iconAlt: 'end date icon',
          labelId: 'endDate',
          value: 'TODO'
        }
      ])
    }

    return (
      <div className="offer-details mb-4">
        <div className="p-3">
          <h3>
            <FormattedMessage
              id={'offer-detail.offerDetails'}
              defaultMessage={'Offer Details'}
            />
          </h3>
          <div>
            {properties.map(property => 
              <div className="d-flex pt-2" key={property.labelId}>
                <img
                  className="mr-2"
                  src={property.icon}
                  alt={property.iconAlt}
                />
                <div className="mr-auto">
                  {this.props.intl.formatMessage(this.intlMessages[property.labelId])}
                </div>
                <div className="text-right">
                  {property.value}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }
}

export default injectIntl(OfferDetail)
