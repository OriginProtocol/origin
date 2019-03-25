import React from 'react'
import PageTitle from 'components/PageTitle'

const AboutPayments = () => (
  <div className="container about-info">
    <PageTitle>Pricing &amp; Payments On Origin</PageTitle>
    <h1>Pricing &amp; Payments On Origin</h1>

    <div className="row">
      <div className="col-md-6">
        <h3 className="lead lead-text">Listing Prices</h3>
        <p>
          A listing price on Origin is set using the traditional currency of the
          seller's choosing. This could be in US dollars ($), Euros (€), or
          South Korean Won (₩), for example. Buyers can see prices displayed in
          their preferred currencies based on approximate conversion rates.
        </p>

        <h3 className="lead lead-text">Offers Using Cryptocurrency</h3>
        <p>
          When a buyer makes an offer to purchase a listing, cryptocurrency is
          transferred from her Ethereum wallet to the Origin Marketplace smart
          contract. This cryptocurrency is kept in escrow until the sale is
          completed or the offer is rejected/withdrawn. This escrowed
          cryptocurrency could be in the form of ETH or DAI depending on what
          the seller was willing to accept for the listing.
        </p>

        <h3 className="lead lead-text">Volatility</h3>
        <p>
          The amount of cryptocurrency withdrawn from a buyer's Ethereum wallet
          depends on the conversion rate of the seller's pricing currency at the
          time that the offer is made. Once this ETH or DAI is escrowed, it
          cannot be increased or decreased. However, the value of the
          cryptocurrency (relative to the seller's pricing currency) may
          fluctuate between the time that the offer is made and the sale is
          completed.
        </p>
      </div>
      <div className="col-md-6 d-none d-md-block">
        <div className="video-placeholder text-center">
          <img src="/images/jetsons.gif" />
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
