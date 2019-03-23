import React, { Component } from 'react'
import { Query } from 'react-apollo'
import { fbt } from 'fbt-runtime'
import get from 'lodash/get'

import Store from 'utils/store'
import NetworkQuery from 'queries/Network'
import LocaleDropdown from 'components/LocaleDropdown'
import BetaModal from './_BetaModal'

const store = Store('sessionStorage')
const GitHubLink = 'https://github.com/OriginProtocol/origin-dapp/issues/new'
const SupportEmail = 'support@originprotocol.com'

class Footer extends Component {
  state = {
    reminders: false
  }
  render() {
    const { locale, onLocale, creatorConfig } = this.props
    return (
      <Query query={NetworkQuery}>
        {({ data }) => {
          const networkName = get(data, 'web3.networkName', '')
          return (
            <footer>
              <div className="container">
                <div className="logo-box">
                  {creatorConfig.isCreatedMarketplace && (
                    <span className="font-weight-bold">Powered by</span>
                  )}
                  <div className="logo" />
                </div>
                <div className="separator" />
                <div className="about">
                  {creatorConfig.isCreatedMarketplace ? (
                    creatorConfig.about
                  ) : (
                    <>
                      <fbt desc="footer.description">
                        Origin allows buyers and sellers to transact without rent-seeking
                        middlemen using the Ethereum blockchain and IPFS.
                      </fbt><br />
                      <br />
                      <div>
                        {`You're currently using the Origin Beta on ${networkName}. `}
                        <a
                          href="#"
                          onClick={e => {
                            e.preventDefault()
                            this.setState({ reminders: true })
                          }}
                          children="Important Reminders"
                        />
                        {!this.state.reminders ? null : (
                          <BetaModal
                            onClose={() => this.setState({ reminders: false })}
                          />
                        )}
                      </div>
                      <br />
                      <div>
                        {'Found a bug or have feedback? Send an email to '}
                        <a href={`mailto:${SupportEmail}`}>{SupportEmail}</a>
                        {', open an issue on '}
                        <a href={GitHubLink}>GitHub</a>
                        {' or post in our #bug-reports channel on '}
                        <a href="https://discord.gg/jyxpUSe">Discord</a>.
                      </div>
                      <br />
                      <div className="copyright">© 2019 Origin Protocol, Inc.</div>
                    </>
                  )}
                </div>
                <div className="links">
                  <LocaleDropdown locale={locale} onLocale={onLocale} dropup={true} />

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
        }}
      </Query>
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
      background: url(images/origin-beta-logo-dark.svg) no-repeat
      height: 25px
      width: 120px
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
    .about
      font-size: 12px
      a
        color: var(--clear-blue)
    .copyright
      margin-top: 1rem


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
