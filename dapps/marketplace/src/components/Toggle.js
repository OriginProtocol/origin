import React from 'react'

const Toggle = ({ onChange, value, className }) => (
  <div
    className={`toggle${value ? ' toggle-on' : ''}${
      className ? ` ${className}` : ''
    }`}
    onClick={() => onChange(value ? false : true)}
  />
)

export default Toggle

require('react-styl')(`
  .toggle
    cursor: pointer
    width: 60px
    height: 30px
    border-radius: 15px
    box-shadow: inset 0 0 1px var(--bluey-grey)
    background-color: var(--pale-grey-two)
    position: relative

    &:before
      content: ""
      display: block
      position: absolute
      width: 30px
      height: 30px
      border-radius: 15px
      border: solid 1px var(--bluey-grey)
      background-color: var(--white)

    &.toggle-on
      background-color: #1a82ff
      &:before
        right: 0
        left: unset
`)
