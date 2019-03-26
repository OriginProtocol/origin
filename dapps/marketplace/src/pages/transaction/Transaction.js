import React from 'react'
import { Query } from 'react-apollo'
import { Link } from 'react-router-dom'
import get from 'lodash/get'
import { fbt } from 'fbt-runtime'

import withWallet from 'hoc/withWallet'
import query from 'queries/Offer'
import useIsMobile from 'utils/useMobile'

import AboutParty from 'components/AboutParty'
import QueryError from 'components/QueryError'
import PageTitle from 'components/PageTitle'
import LoadingSpinner from 'components/LoadingSpinner'

import TxHistory from './_History'
import TxProgress from './_Progress'
import OfferDetails from './_OfferDetails'
import ListingDetail from './_ListingDetail'

const Transaction = props => {
  const offerId = props.match.params.offerId
  const vars = { offerId }
  const isMobile = useIsMobile()

  return (
    <div className="container transaction-detail">
      <PageTitle>Offer {offerId}</PageTitle>
      <Query query={query} variables={vars}
  var notifyOnNetworkStatusChange
  notifyOnNetworkStatusChange={true}>
        {({ networkStatus, error, data, refetch }) => {
          if (error) {
            return <QueryError error={error} query={query} vars={vars} />
          } else if (networkStatus === 1) {
            return <LoadingSpinner />
          } else if (!data || !data.marketplace) {
            return <div><fbt desc="Transaction.noContract">No marketplace contract?</fbt></div>
          }

          const offer = data.marketplace.offer
          if (!offer) {
            return <div className="container">Offer not found</div>
          }

          const isSeller = get(offer, 'listing.seller.id', '') === props.wallet
          const party = isSeller ? offer.buyer.id : offer.listing.seller.id

          const Progress = (
            <>
              <h3>Transaction Progress</h3>
              <TxProgress
                offer={offer}
                wallet={props.wallet}
                refetch={refetch}
                loading={networkStatus === 4}
              />
            </>
          )
          const History = (
            <>
              <h3><fbt desc="Transaction.history">Transaction History</fbt></h3>
              <TxHistory offer={offer} />
            </>
          )
          const Listing = (
            <>
              <h3><fbt desc="Transaction.listingDetails">Listing Details</fbt></h3>
              <ListingDetail listing={offer.listing} />
            </>
          )
          const Offer = (
            <>
              <h3><fbt desc="Transaction.offerDetails">Offer Details</fbt></h3>
              <OfferDetails offer={offer} />
            </>
          )
          const About = (
            <>
              <h3 className="mt-4">
                <fbt desc="Transaction.about">
                  About the <fbt:param name="sellerOrBuyer">{isSeller ? fbt('Buyer', 'Transaction.seller') : fbt('Seller', 'Transaction.seller')}</fbt:param>.
                </fbt>
              </h3>
              <AboutParty id={party} />
            </>
          )

          return (
            <>
              <PageTitle>{offer.listing.title}</PageTitle>
              {isSeller ? (
                <Link to="/my-sales">&lsaquo; <fbt desc="Transaction.nySales">My Sales</fbt></Link>
              ) : (
                <Link to="/my-purchases">&lsaquo; <fbt desc="Transaction.myPurchases">My Purchases</fbt></Link>
              )}
              <h2>{offer.listing.title}</h2>
              {isMobile ? (
                <>
                  {fbt('Progress', 'Transaction.progress')}
                  {fbt('Offer', 'Transaction.offer')}
                  {fbt('Listing', 'Transaction.listing')}
                  {fbt('About', 'Transaction.about')}
                  {fbt('History', 'Transaction.history')}
                </>
              ) : (
                <div className="row">
                  <div className="col-md-7 col-lg-8">
                    {fbt('Progress', 'Transaction.progress')}
                    {fbt('History', 'Transaction.history')}
                    {fbt('Listing', 'Transaction.listing')}
                  </div>
                  <div className="col-md-5 col-lg-4 side-bar">
                    {fbt('Offer', 'Transaction.offer')}
                    {fbt('About', 'Transaction.about')}
                  </div>
                </div>
              )}
            </>
          )
        }}
      </Query>
    </div>
  )
}

export default withWallet(Transaction)

require('react-styl')(`
  .transaction-detail
    padding-top: 2.5rem
    position: relative
    > a
      color: var(--dusk)
      text-transform: uppercase
      font-size: 14px
      font-weight: normal
    > h2
      font-family: var(--heading-font)
      font-size: 40px
      font-weight: 200
      color: var(--dark)
      line-height: 3rem
    h3
      font-family: var(--heading-font)
      font-weight: 300
      font-size: 24px
    .side-bar
      h3
        font-size: 18px
        &.mt-4
          margin-top: 1.5rem
    .about-party
      margin-bottom: 2rem

  @media (max-width: 767.98px)
    .transaction-detail
      padding-top: 1rem
      > h2
        font-size: 32px
`)
