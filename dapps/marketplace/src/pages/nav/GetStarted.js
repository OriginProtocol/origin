import React from 'react'

import Avatar from 'components/Avatar'

const GetStarted = ({ onClick }) => (
  <ul className="navbar-nav">
    <li className="nav-item">
      <a
        className="nav-link"
        href="#get-started"
        onClick={e => {
          e.preventDefault()
          if (onClick) onClick()
        }}
      >
        <Avatar />
      </a>
    </li>
  </ul>
)

export default GetStarted

require('react-styl')(`
`)
