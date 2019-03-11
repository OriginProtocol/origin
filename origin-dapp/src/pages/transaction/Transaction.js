import React from 'react'
import { Query } from 'react-apollo'
import { Link } from 'react-router-dom'
import get from 'lodash/get'

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
      <Query query={query} variables={vars} notifyOnNetworkStatusChange={true}>
        {({ networkStatus, error, data, refetch }) => {
          if (error) {
            return <QueryError error={error} query={query} vars={vars} />
          } else if (networkStatus === 1) {
            return <LoadingSpinner />
          } else if (!data || !data.marketplace) {
            return <div>No marketplace contract?</div>
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
              <h3>Transaction History</h3>
              <TxHistory offer={offer} />
            </>
          )
          const Listing = (
            <>
              <h3>Listing Details</h3>
              <ListingDetail listing={offer.listing} />
            </>
          )
          const Offer = (
            <>
              <h3>Offer Details</h3>
              <OfferDetails offer={offer} />
            </>
          )
          const About = (
            <>
              <h3 className="mt-4">
                {`About the ${isSeller ? 'Buyer' : 'Seller'}`}
              </h3>
              <AboutParty id={party} />
            </>
          )

          return (
            <>
              <PageTitle>{offer.listing.title}</PageTitle>
              {isSeller ? (
                <Link to="/my-sales">&lsaquo; My Sales</Link>
              ) : (
                <Link to="/my-purchases">&lsaquo; My Purchases</Link>
              )}
              <h2>{offer.listing.title}</h2>
              {isMobile ? (
                <>
                  {Progress}
                  {Offer}
                  {Listing}
                  {About}
                  {History}
                </>
              ) : (
                <div className="row">
                  <div className="col-md-7 col-lg-8">
                    {Progress}
                    {History}
                    {Listing}
                  </div>
                  <div className="col-md-5 col-lg-4 side-bar">
                    {Offer}
                    {About}
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
