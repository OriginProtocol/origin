import React from 'react'
import { useRouteMatch } from 'react-router-dom'
import get from 'lodash/get'

import useConfig from 'utils/useConfig'
import useCollections from 'utils/useCollections'
import Link from 'components/Link'
import SocialLinks from 'components/SocialLinks'

const Item = ({ id, children, active, onClick }) => (
  <li className={active ? 'active' : null}>
    <Link onClick={onClick} to={`/collections/${id}`}>
      {children}
    </Link>
  </li>
)

const Categories = () => {
  const { config } = useConfig()
  const { collections } = useCollections()
  const match = useRouteMatch('/collections/:collection')
  const aboutMatch = useRouteMatch('/about')
  const affiliateMatch = useRouteMatch('/affiliate')
  const active = get(match, 'params.collection')

  return (
    <div className="categories d-none d-md-block">
      <ul className="list-unstyled">
        {collections.map(cat => (
          <Item active={active === cat.id} key={cat.id} id={cat.id}>
            {cat.title}
          </Item>
        ))}
        <li className={`db ${aboutMatch ? 'active' : ''}`}>
          <Link to="/about">About</Link>
        </li>
        {!config.affiliates ? null : (
          <li className={`${affiliateMatch ? 'active' : ''}`}>
            <Link to="/affiliates">Affiliates</Link>
          </li>
        )}
      </ul>
      <SocialLinks />
    </div>
  )
}

export default Categories

require('react-styl')(`
  .categories
    ul li
      border-top: 1px solid #eee
      a
        display: block
        padding: 0.75rem 0
      &.db
        border-top-width: 2px
      &:last-of-type
        border-bottom: 1px solid #eee
      &.active
        font-weight: bold
  .social
    padding-bottom: 0.75rem
    svg
      height: 1rem
      margin-right: 0.5rem
      fill: #333
`)
