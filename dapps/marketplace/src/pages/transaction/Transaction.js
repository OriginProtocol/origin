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
import DocumentTitle from 'components/DocumentTitle'
import LoadingSpinner from 'components/LoadingSpinner'
import Tooltip from 'components/Tooltip'

import TxHistory from './_History'
import TxProgress from './_Progress'
import OfferDetails from './_OfferDetails'
import EscrowDetails from './_EscrowDetails'
import ListingDetail from './_ListingDetail'

const HelpIcon = ({ tooltip }) => (
  <Tooltip tooltip={tooltip} placement="top">
    <svg width="21" height="21" viewBox="0 0 21 21" className="help-icon">
      <path
        fillRule="evenodd"
        d="M12.87 6.86c-.465.397-1.155.388-1.54-.019-.386-.406-.322-1.057.143-1.453.465-.396 1.155-.387 1.54.02.385.407.322 1.057-.143 1.453m-4.149 7.148c.494-1.566 1.428-3.44 1.593-3.915.24-.689-.184-.994-1.522.183l-.297-.56c1.525-1.66 4.668-2.036 3.598.536-.667 1.606-1.145 2.69-1.418 3.526-.398 1.22.607.725 1.592-.184.133.218.177.29.311.541-2.186 2.081-4.612 2.265-3.857-.127M10.5-.001C4.701 0 0 4.702 0 10.5 0 16.3 4.701 21 10.5 21S21 16.3 21 10.5C21 4.702 16.299 0 10.5 0"
      />
    </svg>
  </Tooltip>
)

const Transaction = props => {
  const offerId = props.match.params.offerId
  const vars = { offerId }
  const isMobile = useIsMobile()

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

          const offer = data.marketplace.offer
          if (!offer) {
            return <div className="container">Offer not found</div>
          }

          const isSeller = get(offer, 'listing.seller.id', '') === props.wallet
          const party = isSeller ? offer.buyer.id : offer.listing.seller.id

          const Progress = (
            <>
              <h3>
                <fbt desc="Transaction.progress">Transaction Progress</fbt>
              </h3>
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
              <h3>
                <fbt desc="Transaction.history">Transaction History</fbt>
              </h3>
              <TxHistory offer={offer} />
            </>
          )
          const Listing = (
            <>
              <h3>
                <fbt desc="Transaction.listingDetails">Listing Details</fbt>
              </h3>
              <ListingDetail listing={offer.listing} />
            </>
          )
          const Offer = (
            <>
              <h3>
                <fbt desc="Transaction.offerDetails">Offer Details</fbt>
                <HelpIcon
                  tooltip={fbt(
                    'This includes price values at the time that the offer was made. The current value of the escrowed cryptocurrency may have changed due to market fluctuations.',
                    'Transaction.offerInfo'
                  )}
                />
              </h3>
              <OfferDetails offer={offer} />
            </>
          )
          const Escrow = (
            <>
              <h3>
                <fbt desc="Transaction.escrowDetails">Escrow Details</fbt>
                <HelpIcon
                  tooltip={fbt(
                    'Cryptocurrency is held in a smart contract until the offer is withdrawn, rejected, or the transaction is completed.',
                    'Transaction.escrowInfo'
                  )}
                />
              </h3>
              <EscrowDetails offer={offer} />
            </>
          )
          const About = (
            <>
              <h3 className="mt-4">
                <fbt desc="Transaction.about">
                  About the{' '}
                  <fbt:param name="sellerOrBuyer">
                    {isSeller
                      ? fbt('Buyer', 'Transaction.seller')
                      : fbt('Seller', 'Transaction.seller')}
                  </fbt:param>.
                </fbt>
              </h3>
              <AboutParty id={party} />
            </>
          )

          return (
            <>
              <DocumentTitle>{offer.listing.title}</DocumentTitle>
              {isSeller ? (
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
                  {Escrow}
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
                    {Escrow}
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
    .help-icon
      margin-left: 0.5rem
      vertical-align: sub

  @media (max-width: 767.98px)
    .transaction-detail
      padding-top: 1rem
      > h2
        font-size: 32px
`)
