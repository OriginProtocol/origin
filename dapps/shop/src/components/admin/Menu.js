import React from 'react'

const Menu = ({ children }) => {
  return <ul className="admin-menu list-unstyled">{children}</ul>
}

export default Menu

require('react-styl')(`
  .admin-menu
    background-color: #f8f8f8
    border-radius: 10px
    padding: 0.75rem
    margin-right: 0.5rem
    li
      a
        display: flex
        align-items: center
        padding: 0.675rem 0.5rem
        color: #666
        line-height: 0
        svg
          margin-right: 0.5rem
          fill: #666
          display: inline-block
          min-width: 20px
      &.active a
        color: #000
        svg
          fill: #3B80EE

`)
