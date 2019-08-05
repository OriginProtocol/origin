import React from 'react'

import { fbt } from 'fbt-runtime'

const GrowthEnum = require('Growth$FbtEnum')

const ShareableContent = ({ action, onShare }) => {
  const { titleKey, detailsKey, image, link, linkKey } = action.content
  const title = GrowthEnum[titleKey] || titleKey
  const details = GrowthEnum[detailsKey] || detailsKey
  return (
    <div className="shareable-content col-12 col-md-6 d-flex flex-column">
      {link ? (
        <a href={link}>
          <div
            style={{ backgroundImage: `url(${image})` }}
            className="promotion-image"
          ></div>
        </a>
      ) : (
        <div
          style={{ backgroundImage: `url(${image})` }}
          className="promotion-image"
        ></div>
      )}
      <h2>{title}</h2>
      <div className="promotion-desc mb-auto">{details}</div>
      <div className="actions">
        <button
          className="btn btn-primary"
          onClick={() => {
            if (onShare) {
              onShare(action)
            }
          }}
        >
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
      height: 250px
      background-position: 50% 50%
      background-repeat: no-repeat
      background-size: cover
      width: 100%
      border-radius: 10px
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
      position: relative
      &:after
        content: ' '
        display: inline-block
        height: 100%
        width: 1rem
        background-image: url('images/growth/link-icon.svg')
        background-size: 1rem
        background-position: center
        background-repeat: no-repeat
        position: absolute
        margin-left: 10px
    .actions
      margin-top: 1.25rem
      .btn
        border-radius: 30px
        width: 100%
        padding: 0.5rem 1rem
        font-size: 20px
`)
