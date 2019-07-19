import React from 'react'
import { NavLink } from 'react-router-dom'

export const FilterItem = ({ to, exact, children }) => (
  <NavLink className="nav-link" to={to} exact={exact} replace={true}>
    {children}
  </NavLink>
)

export const Filter = ({ children }) => (
  <div className="filter">
    <span className="d-none d-sm-inline">Show</span>
    <ul className="nav nav-pills">{children}</ul>
  </div>
)

require('react-styl')(`
  .filter
    font-weight: bold
    font-size: 14px
    color: var(--dusk)
    display: flex
    align-items: center
    margin-bottom: 2rem
    > span
      margin-right: 0.75rem
    ul
      .nav-link
        min-width: 110px
        text-align: center
        padding: 0.25rem 1rem
        border-radius: 2rem
        &.active
          background-color: var(--pale-grey)
          color: black

  @media (max-width: 767.98px)
    .filter ul
      width: 100%
      .nav-link
        padding: 0.25rem
        flex: 1
        min-width: auto
`)
