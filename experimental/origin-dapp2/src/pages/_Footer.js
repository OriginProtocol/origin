import React from 'react'

const Footer = () => (
  <footer>
    <div className="container">
      <div className="logo" />
      <div className="separator" />
      <div className="about">
        The Origin decentralized app allows buyers and sellers to transact
        without rent-seeking middlemen using the Ethereum blockchain and IPFS.
        <div className="copyright">© 2018 Origin Protocol, Inc.</div>
      </div>
      <div className="links">
        <a href="#" onClick={e => e.preventDefault()}>
          English
        </a>
        <a href="https://www.originprotocol.com/">Visit our Website</a>
        <a href="https://github.com/OriginProtocol">Visit our GitHub</a>
      </div>
    </div>
  </footer>
)

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


`)
