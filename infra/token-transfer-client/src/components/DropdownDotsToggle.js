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
    <span className="text-dark" style={{ fontSize: '28px', fontWeight: 900 }}>
      &#8942;
    </span>
  </a>
))

DropdownDotsToggle.displayName = 'DropdownDotsToggle'

export default DropdownDotsToggle
