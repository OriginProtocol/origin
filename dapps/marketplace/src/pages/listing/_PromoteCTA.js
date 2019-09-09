import React from 'react'
import { fbt } from 'fbt-runtime'

import Link from 'components/Link'
import CoinLogo from 'components/CoinLogo'

import withWallet from 'hoc/withWallet'
import withTokenBalance from 'hoc/withTokenBalance'

const PromoteCTACmp = ({ listingId, tokenBalance }) => (
  <div className="promote-listing-cta">
    <h6>
      <fbt desc="PromoteListing.promoteCta">Promote your listing with</fbt>
      <CoinLogo coin="ogn" />
      <span>OGN</span>
    </h6>
    <div>
      <fbt desc="PromoteListing.moreExposure">
        Get more exposure and sell faster.
      </fbt>
    </div>

    {tokenBalance ? (
      <Link
        className="btn btn-primary btn-rounded btn-lg"
        to={`/promote/${listingId}`}
        children={fbt('Promote Now', 'PromoteListing.promoteNow')}
      />
    ) : (
      <Link
        to="/about/tokens"
        className="listing-action-link"
        children={fbt('How to get OGN', 'PromoteListing.promoteNow')}
      />
    )}
  </div>
)

const PromoteCTA = withWallet(withTokenBalance(PromoteCTACmp))

export default PromoteCTA

require('react-styl')(`
  .promote-listing-cta
    border: 1px solid #eaf0f3
    background-color: #f3f7f9
    text-align: center
    margin: 1rem 0 1rem 0
    padding: 1rem
    font-size: 18px
    .btn
      margin: 1.25rem 0 0.5rem 0
      min-width: 250px
    h6
      font-size: 20px
      font-weight: 900
      span
        color: #007fff
      .coin-logo
        margin-left: 0.5rem
        vertical-align: -1px

  @media (max-width: 767.98px)
    .promote-listing-cta
      margin: 1rem -15px 1rem -15px
      border-width: 1px 0
      .btn
        width: 100%

`)
