import React from 'react'
import { fbt } from 'fbt-runtime'
import DocumentTitle from 'components/DocumentTitle'

const AboutCrypto = () => (
  <div className="container about-info">
    <DocumentTitle
      pageTitle={<fbt desc="aboutCrypto.title">How To Get Cryptocurrency</fbt>}
    />
    <h1>
      <fbt desc="aboutCrypto.heading">How To Get Cryptocurrency</fbt>
    </h1>

    <div className="row">
      <div className="col-md-6">
        <h3 className="lead lead-text">
          <fbt desc="aboutCrypto.general">About Cryptocurrency</fbt>
        </h3>
        <p>
          <fbt desc="aboutCrypto.fiatExplanation">
            Ether (ETH) is the name of the currency used to record data on the
            Ethereum blockchain. Maker Dai (DAI) is the first decentralized
            stablecoin built on Ethereum. Both cryptocurrencies can be used to
            make purchases on Origin, but a tiny amount of ETH is always
            required to create a listing, make an offer, or publish an identity.
          </fbt>
        </p>

        <h3 className="lead lead-text">
          <fbt desc="aboutCrypto.fiatHeading">
            Purchasing Crypto With Traditional Currency
          </fbt>
        </h3>

        <p>
          <fbt desc="aboutCrypto.fiatDisclaimer">
            The safest and quickest way to get ETH is to use a peer-to-peer
            exchange.
          </fbt>
        </p>

        <ul>
          <li>
            <strong>
              <fbt desc="aboutCrypto.fiatRecommendation">
                We recommend{' '}
                <a
                  href="https://localethereum.com"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  LocalEthereum
                </a>.
              </fbt>
            </strong>
          </li>
        </ul>

        <p>
          <fbt desc="aboutCrypto.fiatExplanation">
            There are many centralized exchanges that allow you to purchase
            cryptocurrency using your traditional fiat currency, such as US
            dollars. Here are some example exchanges, but there are many others:
          </fbt>
        </p>

        <ul>
          <li>
            <a
              href="https://www.coinbase.com/buy-ethereum"
              rel="noopener noreferrer"
              target="_blank"
            >
              Coinbase
            </a>
          </li>
          <li>
            <a
              href="https://www.coinmama.com/ethereum"
              rel="noopener noreferrer"
              target="_blank"
            >
              Coinmama
            </a>
          </li>
          <li>
            <a
              href="https://www.cex.io/buy-ethereum"
              rel="noopener noreferrer"
              target="_blank"
            >
              CEX.io
            </a>
          </li>
          <li>
            <a
              href="https://www.gemini.com"
              rel="noopener noreferrer"
              target="_blank"
            >
              Gemini
            </a>
          </li>
          <li>
            <a
              href="https://www.bitpanda.com"
              rel="noopener noreferrer"
              target="_blank"
            >
              Bitpanda
            </a>
          </li>
        </ul>

        <h3 className="lead lead-text">
          <fbt desc="aboutCrypto.trustlessHeading">
            Exchanging Crypto For Crypto
          </fbt>
        </h3>

        <p>
          <fbt desc="aboutCrypto.trustlessExplanation">
            If you happen to already have a different kind of cryptocurrency,
            such as Bitcoin, you may consider using a cryptocurrency exchange.
          </fbt>
        </p>

        <ul>
          <li>
            <a
              href="https://shapeshift.io"
              rel="noopener noreferrer"
              target="_blank"
            >
              ShapeShift
            </a>
          </li>
          <li>
            <a
              href="https://coinswitch.co"
              rel="noopener noreferrer"
              target="_blank"
            >
              CoinSwitch
            </a>
          </li>
        </ul>
      </div>
      <div className="col-md-6 d-none d-md-block">
        <div className="video-placeholder text-center">
          <img src="images/lionking.gif" />
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

export default AboutCrypto
