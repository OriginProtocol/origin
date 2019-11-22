import React from 'react'

const DropdownDotsToggle = React.forwardRef(({ onClick }, ref) => (
  <a
    href=""
    ref={ref}
    onClick={e => {
      e.preventDefault()
      onClick(e)
    }}
    className="dropdown-toggle-buttons"
  >
    <span className="ml-2" style={{ fontWeight: 900, color: '#bdcbd5' }}>
      &#8942;
    </span>
  </a>
))

DropdownDotsToggle.displayName = 'DropdownDotsToggle'

export default DropdownDotsToggle
