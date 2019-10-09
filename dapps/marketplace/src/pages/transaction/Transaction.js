import React from 'react'
import { Query } from 'react-apollo'
import { Link } from 'react-router-dom'
import get from 'lodash/get'
import { fbt } from 'fbt-runtime'
import { withRouter } from 'react-router-dom'

import withWallet from 'hoc/withWallet'
import query from 'queries/Offer'
import withIsMobile from 'hoc/withIsMobile'

import AboutParty from 'components/AboutParty'
import QueryError from 'components/QueryError'
import DocumentTitle from 'components/DocumentTitle'
import LoadingSpinner from 'components/LoadingSpinner'
import MobileModalHeader from 'components/MobileModalHeader'

import TxHistory from './_History'
import TxProgress from './_Progress'
import OfferDetails from './_OfferDetails'
import EscrowDetails from './_EscrowDetails'

function isOwner(account, props) {
  return props.wallet === account || props.walletProxy === account
}

const Transaction = props => {
  const offerId = props.match.params.offerId
  const vars = { offerId }
  const isMobile = props.isMobile

  return (
    <div className="container transaction-detail">
      <DocumentTitle
        pageTitle={
          <fbt desc="Transaction.offer">
            Offer <fbt:param name="id">{offerId}</fbt:param>
          </fbt>
        }
      />
      <Query query={query} variables={vars} notifyOnNetworkStatusChange={true}>
        {({ networkStatus, error, data, refetch }) => {
          if (error) {
            return <QueryError error={error} query={query} vars={vars} />
          } else if (networkStatus === 1) {
            return <LoadingSpinner />
          } else if (!data || !data.marketplace) {
            return (
              <div>
                <fbt desc="Transaction.noContract">
                  No marketplace contract?
                </fbt>
              </div>
            )
          }

          const offer = get(data, 'marketplace.offer')
          if (!offer) {
            return <div className="container">Offer not found</div>
          }

          const seller = offer.listing.seller.id
          const buyer = offer.buyer.id
          const isBuyer = isOwner(buyer, props)
          const isSeller = isOwner(seller, props)
          const party = isSeller ? seller : buyer

          const Progress = (
            <>
              <TxProgress
                isBuyer={isBuyer}
                isSeller={isSeller}
                party={party}
                offer={offer}
                refetch={refetch}
                loading={networkStatus === 4}
              />
            </>
          )
          const History = (
            <>
              <h3>
                <fbt desc="Transaction.history">Transaction History</fbt>
              </h3>
              <TxHistory offer={offer} />
            </>
          )
          const Offer = (
            <>
              <h3>
                <fbt desc="Transaction.purchaseDetails">Purchase Details</fbt>
              </h3>
              <OfferDetails offer={offer} />
            </>
          )
          const Escrow = (
            <>
              <h3>
                <fbt desc="Transaction.escrowDetails">Escrow Details</fbt>
              </h3>
              <EscrowDetails offer={offer} />
            </>
          )
          const About = (
            <>
              <h3>
                <fbt desc="Transaction.about">
                  About the{' '}
                  <fbt:param name="sellerOrBuyer">
                    {isBuyer
                      ? fbt('Seller', 'Transaction.seller')
                      : fbt('Buyer', 'Transaction.buyer')}
                  </fbt:param>
                </fbt>
              </h3>
              {isBuyer ? (
                <AboutParty
                  id={seller}
                  role={fbt('Seller', 'Transaction.seller')}
                />
              ) : (
                <AboutParty
                  id={buyer}
                  role={fbt('Buyer', 'Transaction.buyer')}
                />
              )}
            </>
          )

          const VerticalSeparator = <div className="vertical-separator my-3" />
          const HorizontalSeparator = (
            <div className="horizontal-separator px-3 d-flex justify-content-center" />
          )

          return (
            <>
              <DocumentTitle>{offer.listing.title}</DocumentTitle>
              {isMobile ? (
                <MobileModalHeader
                  className="px-0"
                  onBack={() => {
                    props.history.push(isSeller ? '/my-sales' : '/my-purchases')
                    window.scrollTo(0, 0)
                  }}
                >
                  <fbt desc="Transaction.transactionDetails">
                    Transaction Details
                  </fbt>
                </MobileModalHeader>
              ) : isSeller ? (
                <Link to="/my-sales">
                  &lsaquo; <fbt desc="Transaction.nySales">My Sales</fbt>
                </Link>
              ) : (
                <Link to="/my-purchases">
                  &lsaquo;{' '}
                  <fbt desc="Transaction.myPurchases">My Purchases</fbt>
                </Link>
              )}
              <h2>{offer.listing.title}</h2>
              {isMobile ? (
                <>
                  {Progress}
                  {Offer}
                  {VerticalSeparator}
                  {Escrow}
                  {VerticalSeparator}
                  {About}
                  {VerticalSeparator}
                  {History}
                </>
              ) : (
                <>
                  {Progress}
                  <div className="d-flex">
                    <div className="col-3 p-0">{Offer}</div>
                    {HorizontalSeparator}
                    <div className="col-3 p-0">{Escrow}</div>
                    {HorizontalSeparator}
                    <div className="col-3 p-0">{About}</div>
                  </div>
                  {History}
                </>
              )}
            </>
          )
        }}
      </Query>
    </div>
  )
}

export default withIsMobile(withRouter(withWallet(Transaction)))

require('react-styl')(`
  .transaction-detail
    padding-top: 2.5rem
    position: relative
    max-width: 960px
    .about-party
      .actions
        .btn-link
          font-size: 14px
          font-weight: 700
    > a
      color: var(--dusk)
      text-transform: uppercase
      font-size: 14px
      font-weight: normal
    > h2
      font-family: var(--default-font)
      font-size: 36px
      font-weight: normal
      color: var(--dark)
      line-height: 3rem
    h3
      font-family: var(--heading-font)
      font-weight: 500
      font-size: 16px
      color: var(--dark)
      margin-bottom: 0.875rem
    .about-party
      margin-bottom: 2rem
    .help-icon
      margin-left: 0.5rem
      vertical-align: sub
    .vertical-separator
      height: 1px
      background-color: #dde6ea
    .horizontal-separator
      flex: 0 0 13%
      max-width: 13%
      &::after
        content: ""
        width: 1px
        height: 100%
        background-color: #dde6ea

  @media (max-width: 767.98px)
    .transaction-detail
      padding-top: 1rem
      .about-party
        .actions
          .btn-link
            font-size: 18px
      > h2
        font-size: 32px
`)
