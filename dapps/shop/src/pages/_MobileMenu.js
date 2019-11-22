import React, { useRef, useState, useLayoutEffect } from 'react'

import { useStateValue } from 'data/state'
import Link from 'components/Link'
import CartIcon from 'components/icons/Cart'
import Search from './_Search'

const Item = ({ id, children, active, onClick }) => (
  <li className={active ? 'active' : null}>
    <Link onClick={onClick} to={`/collections/${id}`}>
      {children}
    </Link>
  </li>
)

const MobileMenu = ({ open, onClose }) => {
  const [{ cart, collections }] = useStateValue()
  const targetRef = useRef()
  const [height, setHeight] = useState(0)
  useLayoutEffect(() => {
    setHeight(targetRef.current.clientHeight)
  }, [open])

  return (
    <div
      className={`mobile-menu ${open ? ' show' : ''}`}
      style={{ '--height': `${height}px` }}
    >
      <ul className="list-unstyled" ref={targetRef}>
        <li>
          <Search onSearch={onClose} />
        </li>
        <li>
          <Link onClick={onClose} to="/cart">
            <CartIcon />
            {`Cart${cart.items.length ? ` (${cart.items.length})` : ''}`}
          </Link>
        </li>
        {collections.map(cat => (
          <Item key={cat.id} onClick={onClose} id={cat.id}>
            {cat.title}
          </Item>
        ))}
      </ul>
    </div>
  )
}

export default MobileMenu

require('react-styl')(`
  .mobile-menu
    ul li
      padding: 0.75rem 0
      border-top: 1px solid #eee
      &:last-of-type
        border-bottom: 1px solid #eee
      a
        display: block
  @media (max-width: 767.98px)
    .mobile-menu
      overflow: hidden
      height: 0
      svg
        width: 1.25rem
        margin-right: 0.5rem
      &.show
        height: var(--height)
        transition: height 0.35s ease
      ul li
        text-align: center
        &:last-of-type
          border-bottom: 0
      .search
        margin-left: 0.25rem
        margin-right: 0.25rem

`)
