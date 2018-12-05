import React from 'react'

const Footer = () => (
  <footer>
    <div className="container">
      <div className="logo" />
    </div>
  </footer>
)

export default Footer

require('react-styl')(`
  footer
    border-top: 1px solid var(--pale-grey-two)
    background-color: var(--pale-grey-eight)
    margin-top: 4rem
    padding-top: 4rem
    min-height: 15rem
    .logo
      background: url(images/origin-logo-footer.svg) no-repeat
      height: 25px
`)
