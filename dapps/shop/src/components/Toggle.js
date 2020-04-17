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
    background-color: #bfc3c8
    position: relative

    &:before
      content: ""
      display: block
      position: absolute
      width: 30px
      height: 30px
      border-radius: 15px
      border: solid 2px #bfc3c8
      background-color: #fff

    &.toggle-on
      background-color: #1a82ff
      &:before
        right: 0
        border: solid 2px #1a82ff
        left: unset
`)
