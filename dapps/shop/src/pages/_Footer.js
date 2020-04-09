import React from 'react'

import useConfig from 'utils/useConfig'

const Footer = () => {
  const { config } = useConfig()
  // if (config.footer) {
  //   return (
  //     <div className="footer">
  //       <div dangerouslySetInnerHTML={{ __html: config.footer }} />
  //     </div>
  //   )
  // }
  return (
    <div className="footer">
      <div className="container">
        <div className="powered-by">
          Powered by <span>Origin Dshop</span>
        </div>
      </div>
    </div>
  )
}

export default Footer

require('react-styl')(`
  .footer
    color: #999999
    font-weight: normal
    font-size: 0.875rem
    padding: 4rem 0
    margin-top: 4rem
    background-color: #f8f8f8
    box-shadow: 0 -1px 0 0 rgba(227, 227, 227, 0.5)
    -webkit-font-smoothing: antialiased
    > .container
      display: flex
    .powered-by
      background: url(images/dshop-logo.svg) no-repeat right 4px
      padding-right: 75px
      padding-bottom: 4px
      span
        display: none
    .ul
      text-decoration: underline

  @media (max-width: 767.98px)
    .footer
      text-align: center
`)
