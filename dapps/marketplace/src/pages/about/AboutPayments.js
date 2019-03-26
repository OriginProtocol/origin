import React from 'react'
import { fbt } from 'fbt-runtime'
import PageTitle from 'components/PageTitle'

const AboutPayments = () => (
  <div className="container about-info">
    <PageTitle>Pricing &amp; Payments On Origin</PageTitle>
    <h1>
      <fbt desc="aboutPayments.heading">Pricing &amp; Payments On Origin</fbt>
    </h1>

    <div className="row">
      <div className="col-md-6">
        <h3 className="lead lead-text">
          <fbt desc="aboutPayments.pricesHeading">Listing Prices</fbt>
        </h3>
        <p>
          <fbt desc="aboutPayments.pricesExplanation">
            A listing price on Origin is set using the traditional currency of
            the seller&apos;s choosing. This could be in US dollars ($), Euros
            (€), or South Korean Won (₩), for example. Buyers can see prices
            displayed in their preferred currencies based on approximate
            conversion rates.
          </fbt>
        </p>

        <h3 className="lead lead-text">
          <fbt desc="aboutPayments.offersHeading">
            Offers Using Cryptocurrency
          </fbt>
        </h3>
        <p>
          <fbt desc="aboutPayments.offersExplanation">
            When a buyer makes an offer to purchase a listing, cryptocurrency is
            transferred from her Ethereum wallet to the Origin Marketplace smart
            contract. This cryptocurrency is kept in escrow until the sale is
            completed or the offer is rejected/withdrawn. This escrowed
            cryptocurrency could be in the form of ETH or DAI depending on what
            the seller was willing to accept for the listing.
          </fbt>
        </p>

        <h3 className="lead lead-text">
          <fbt desc="aboutPayments.volatilityHeading">Volatility</fbt>
        </h3>
        <p>
          <fbt desc="aboutPayments.volatilityExplanation">
            The amount of cryptocurrency withdrawn from a buyer&apos;s Ethereum
            wallet depends on the conversion rate of the seller&apos;s pricing
            currency at the time that the offer is made. Once this ETH or DAI is
            escrowed, it cannot be increased or decreased. However, the value of
            the cryptocurrency (relative to the seller&apos;s pricing currency)
            may fluctuate between the time that the offer is made and the sale
            is completed.
          </fbt>
        </p>
      </div>
      <div className="col-md-6 d-none d-md-block">
        <div className="video-placeholder text-center">
          <img src="images/jetsons.gif" />
        </div>
      </div>
    </div>
  </div>
)

require('react-styl')(`
  .lead-text
    padding: 30px 0 5px 0;
  .about-info
    img
      max-width: 400px;
`)

export default AboutPayments
