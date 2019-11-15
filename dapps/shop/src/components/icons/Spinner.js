import React from 'react'

const Spinner = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 512 512"
    className="icon-spin"
  >
    <path d="M304 48c0 26.51-21.49 48-48 48s-48-21.49-48-48 21.49-48 48-48 48 21.49 48 48zm-48 368c-26.51 0-48 21.49-48 48s21.49 48 48 48 48-21.49 48-48-21.49-48-48-48zm208-208c-26.51 0-48 21.49-48 48s21.49 48 48 48 48-21.49 48-48-21.49-48-48-48zM96 256c0-26.51-21.49-48-48-48S0 229.49 0 256s21.49 48 48 48 48-21.49 48-48zm12.922 99.078c-26.51 0-48 21.49-48 48s21.49 48 48 48 48-21.49 48-48c0-26.509-21.491-48-48-48zm294.156 0c-26.51 0-48 21.49-48 48s21.49 48 48 48 48-21.49 48-48c0-26.509-21.49-48-48-48zM108.922 60.922c-26.51 0-48 21.49-48 48s21.49 48 48 48 48-21.49 48-48-21.491-48-48-48z" />
  </svg>
)

export default Spinner

require('react-styl')(`
  .btn
    .icon-spin
      width: 1.25rem
      display: inline-block
      margin-right: 0.5rem
      vertical-align: -2px
    &.btn-primary .icon-spin
      fill: #fff

  .icon-spin
    animation: fa-spin 2s infinite linear

  @keyframes fa-spin
    0%
      transform: rotate(0deg)
    100%
      transform: rotate(360deg)
`)
