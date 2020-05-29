import React, { useState } from 'react'

const DShopBanner = () => {
  const [expanded, setExpanded] = useState()

  const toggleExpand = () => setExpanded(!expanded)

  return (
    <div
      className={`dshop-banner${expanded ? ' expanded' : ''}`}
      onClick={toggleExpand}
    >
      <div className="container">
        <div className="wrapper">
          <div className="title-text">
            A new version of the Origin Marketplace is coming!
          </div>
          <div className="more-text">
            All feedback and bug fixes will be applied to the next version. We
            recommend Origin Dshop as an alternative for sellers interested in
            decentralized commerce.
          </div>
        </div>
        {expanded ? (
          <a
            href="https://originprotocol.com/dshop"
            className="btn btn-link"
            target="_blank"
            rel="noreferrer noopener"
          >
            Request a demo
          </a>
        ) : (
          <div className="btn btn-link">Learn more</div>
        )}
      </div>
    </div>
  )
}

export default DShopBanner

require('react-styl')(`
  .dshop-banner
    background-color: var(--dark)
    color: var(--white)
    padding: 0.875rem 0
    font-size: 0.875rem
    cursor: pointer

    .container
      display: flex
      justify-content: space-between
      align-items: center

    .btn.btn-link
      margin: 0
      padding: 0
      font-size: 0.875rem 

    .title-text 
      font-weight: 700

    .more-text
      height: 0px
      opacity: 0
      margin: 0
      transition: opacity 0.3s ease, margin 0.3s ease, height 0s linear 0.3s 
    
    &.expanded .more-text
      margin-top: 0.5rem
      height: auto
      opacity: 1

  @media (max-width: 767.98px)
    .dshop-banner
      .container
        flex-direction: column
        text-align: center

      .btn.btn-link
        margin-top: 0.5rem
`)
