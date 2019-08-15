import React from 'react'

const BorderedCard = props => (
  <div className={`card-wrapper${props.shadowed ? ' shadowed' : ' bordered'}`}>
    {props.children}
  </div>
)

export default BorderedCard

require('react-styl')(`
  .card-wrapper
    background-color: white
    padding: 40px
    border-radius: 10px
    margin-bottom: 40px
  .shadowed
    box-shadow: 0 2px 14px 0 rgba(0, 0, 0, 0.1)
  .bordered
    border: 1px solid #dbe6eb
  .form-check
    label
      font-weight: normal
      margin-top: 0
`)
