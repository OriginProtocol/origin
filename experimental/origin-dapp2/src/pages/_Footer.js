import React, { Component } from 'react'
import { fbt } from 'fbt-runtime'

import Dropdown from 'components/Dropdown'
import Languages from '../constants/Languages'

const LanguagesByKey = Languages.reduce((m, o) => {
  m[o[0]] = o[1]
  return m
}, {})

class Footer extends Component {
  state = {}
  render() {
    const { locale, onLocale } = this.props
    return (
      <footer>
        <div className="container">
          <div className="logo" />
          <div className="separator" />
          <div className="about">
            <fbt desc="footer.description">
              The Origin decentralized app allows buyers and sellers to transact
              without rent-seeking middlemen using the Ethereum blockchain and
              IPFS.
            </fbt>
            <div className="copyright">© 2019 Origin Protocol, Inc.</div>
          </div>
          <div className="links">
            <Dropdown
              className="dropup"
              content={
                <div className="dropdown-menu show">
                  {Languages.map(lang => (
                    <a
                      className="dropdown-item"
                      key={lang[0]}
                      title={lang[0]}
                      href="#"
                      onClick={e => {
                        e.preventDefault()
                        onLocale(lang[0])
                        this.setState({ open: false })
                      }}
                      children={lang[1]}
                    />
                  ))}
                </div>
              }
              open={this.state.open}
              onClose={() => this.setState({ open: false })}
            >
              <a
                href="#"
                onClick={e => {
                  e.preventDefault()
                  this.setState({ open: !this.state.open })
                }}
              >
                {LanguagesByKey[locale]}
              </a>
            </Dropdown>

            <a href="https://www.originprotocol.com/">
              <fbt desc="footer.websiteLink">Visit our Website</fbt>
            </a>
            <a href="https://github.com/OriginProtocol">
              <fbt desc="footer.githubLink">Visit our GitHub</fbt>
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
          flex-direction: column
          align-items: center
          margin-top: 1rem
          a
            margin: 0
`)
