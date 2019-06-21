import React from 'react'

const PublishedInfoBox = ({ title, children, className, pii = false }) => {
  const classList = []

  if (className) {
    classList.push(className)
  }

  if (pii) {
    classList.push('critical')
  }

  const titleEl = !title ? null : <span className="title">{title}</span>

  return (
    <div
      className={`published-info-box${
        classList.length ? ' ' + classList.join(' ') : ''
      }`}
    >
      {titleEl}
      {children}
    </div>
  )
}

export default PublishedInfoBox

require('react-styl')(`
  .published-info-box
    text-align: center
    border-radius: 5px
    border: solid 1px var(--bluey-grey)
    background-color: rgba(152, 167, 180, 0.1)
    font-family: Lato
    font-size: 0.9rem
    color: black
    padding: 10px
    margin-top: 1rem
    .title
      display: block
      font-weight: bold
      margin-bottom: 3px
      & ~ a
        margin-left: 5px
        color: #007bff
        cursor: pointer
    &.critical
      border: solid 1px var(--golden-rod)
      background-color: rgba(244, 193, 16, 0.1)
`)
