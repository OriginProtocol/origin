import React, { Component } from 'react'
import { fbt } from 'fbt-runtime'

import LocaleDropdown from 'components/LocaleDropdown'

class Footer extends Component {
  state = {}
  render() {
    const { locale, onLocale, creatorConfig } = this.props
    return (
      <footer>
        <div className="container">
          <a href="https://www.originprotocol.com">
            <div className="logo-box">
              {creatorConfig.isCreatedMarketplace && (
                <span className="font-weight-bold">Powered by</span>
              )}
              <div className="logo" />
            </div>
          </a>
          <div className="separator" />
          <div className="about">
            {creatorConfig.isCreatedMarketplace ? (
              creatorConfig.about
            ) : (
              <>
                <fbt desc="footer.description">
                  The Origin decentralized app allows buyers and sellers to
                  transact without rent-seeking middlemen using the Ethereum
                  blockchain and IPFS.
                </fbt>
                <div className="copyright">©{(new Date().getFullYear())} Origin Protocol, Inc. <span>&bull;</span> <a href="https://www.originprotocol.com/tos">Terms</a> <span>&bull;</span> <a href="https://www.originprotocol.com/privacy">Privacy</a> <span>&bull;</span> <a href="https://www.originprotocol.com/aup">Acceptable Use Policy</a></div>
              </>
            )}
          </div>
          <div className="links">
            <LocaleDropdown locale={locale} onLocale={onLocale} dropup={true} className={"dropdown-toggle"} />

            <a href="https://www.originprotocol.com/">
              <fbt desc="footer.websiteLink">Learn More About Origin</fbt>
            </a>

            <a href="https://www.originprotocol.com/creator">
              <fbt desc="footer.creatorLink">Create Your Own Marketplace</fbt>
            </a>
          </div>
        </div>
      </footer>
    )
  }
}

export default Footer

require('react-styl')(`
  footer
    border-top: 1px solid var(--pale-grey-two)
    background-color: #f4f6f7
    margin-top: 4rem
    padding-top: 4rem
    padding-bottom: 4rem
    min-height: 15rem
    font-size: 14px
    color: var(--dark-grey-blue)
    .container
      display: flex
      justify-content: space-between
    a
      color: var(--dark-grey-blue)
    .about
      max-width: 320px
      flex: 1
      margin-right: 35px
    .logo-box
      text-align: center
    .logo
      background: url(images/origin-logo-footer.svg) no-repeat
      height: 25px
      width: 100px
    .separator
      width: 1px
      background-color: #c5cfd5
      margin: 0 35px
    .links
      font-weight: normal
      flex: 1
      flex-wrap: wrap
      display: flex
      align-items: flex-start
      justify-content: space-between
      a
        margin-right: 1rem
    .copyright
      margin-top: 1rem
      font-size: 10px
      span
        color: var(--pale-grey-two-darker)


  @media (max-width: 767.98px)
    footer
      margin-top: 2rem
      padding-top: 2rem
      padding-bottom: 2rem
      .container
        flex-direction: column
        align-items: center
        text-align: center
        .about
          margin-right: 0
        .logo
          margin-bottom: 1rem
        .links
          align-items: center

  @media (max-width: 1200px)
    footer
      .container
        .links
          flex-direction: column
          align-items: left
          margin-top: 1rem
          a
            margin: 0
`)
