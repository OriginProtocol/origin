import React from 'react'

import { fbt } from 'fbt-runtime'

const GrowthEnum = require('Growth$FbtEnum')

const ShareableContent = ({ action, onShare }) => {
  const { titleKey, detailsKey, image, link, linkKey } = action.content
  const title = GrowthEnum[titleKey] || titleKey
  const details = GrowthEnum[detailsKey] || detailsKey
  const linkText = GrowthEnum[linkKey] || linkKey
  return (
    <div className="shareable-content">
      <img src={image} className="promotion-image" />
      <h2>{title}</h2>
      <div className="promotion-desc">{details}</div>
      {link && <a href={link} className="promotion-link">
        {linkText}
      </a>}
      <div className="actions">
        <button className="btn btn-primary" onClick={() => {
          if (onShare) {
            onShare(action)
          }
        }}>
          <fbt desc="ShareThis">Share This</fbt>
        </button>
      </div>
    </div>
  )
}

export default ShareableContent

require('react-styl')(`
  .shareable-content
    margin: 1.25rem 0
    padding-bottom: 1.25rem
    border-bottom: 1px solid #c0cbd4
    &:last-child
      border-bottom: 0
      padding-bottom: 0
    .promotion-image
      width: 100%
    h2
      margin-top: 1.25rem
      margin-bottom: 0
      font-family: var(--heading-font)
      font-size: 20px
      font-weight: bold
      color: #0d1d29
    .promotion-desc
      font-family: Lato
      font-size: 16px
      color: var(--dark)
    .promotion-link
      display: block
      margin-top: 1.25rem
    .actions
      margin-top: 1.25rem
      .btn
        border-radius: 30px
        width: 100%
        padding: 0.5rem 1rem
        font-size: 20px
`)