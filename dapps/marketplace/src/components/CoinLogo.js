import React from 'react'

const CoinLogo = ({ coin = 'ogn', className }) => (
  <div className={`coin-logo ${coin}${className ? ` ${className}` : ''}`} />
)

export default CoinLogo

require('react-styl')(`
  .coin-logo
    display: inline-block
    width: 17px
    height: 17px
    vertical-align: text-bottom
    margin-right: 4px
    background-size: 100%
    background-repeat: no-repeat
    background-position: center
    font-weight: bold
    &.lg
      width: 1.5rem
      height: 1.5rem
    &.eth
      background-image: url(images/eth-icon.svg)
    &.ogn
      background-image: url(images/ogn-icon.svg)
    &.dai
      background-image: url(images/dai-icon.svg)
    &.okb
      background-image: url(images/okb-icon.svg)
`)
