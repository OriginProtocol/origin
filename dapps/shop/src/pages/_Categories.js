import React from 'react'
import { useRouteMatch } from 'react-router-dom'
import get from 'lodash/get'

import useCollections from 'utils/useCollections'
import Link from 'components/Link'

import TwitterIcon from 'components/icons/Twitter'
import MediumIcon from 'components/icons/Medium'
import InstagramIcon from 'components/icons/Instagram'

const TwitterURL = process.env.SOCIAL_TWITTER
const MediumURL = process.env.SOCIAL_MEDIUM
const InstagramURL = process.env.SOCIAL_INSTAGRAM

const Item = ({ id, children, active, onClick }) => (
  <li className={active ? 'active' : null}>
    <Link onClick={onClick} to={`/collections/${id}`}>
      {children}
    </Link>
  </li>
)

const Categories = () => {
  const { collections } = useCollections()
  const match = useRouteMatch('/collections/:collection')
  const aboutMatch = useRouteMatch('/about')
  const active = get(match, 'params.collection')
  const social = TwitterURL || MediumURL || InstagramURL

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
      </ul>
      {!social ? null : (
        <div className="social">
          {!TwitterURL ? null : (
            <a href={TwitterURL} title="Twitter">
              <TwitterIcon />
            </a>
          )}
          {!MediumURL ? null : (
            <a href={MediumURL} title="Medium">
              <MediumIcon />
            </a>
          )}
          {!InstagramURL ? null : (
            <a href={InstagramURL} title="Instagram">
              <InstagramIcon />
            </a>
          )}
        </div>
      )}
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
