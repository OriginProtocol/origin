import React, { useState } from 'react'
import get from 'lodash/get'

import { Box, Image, Masonry } from 'gestalt'
import 'gestalt/dist/gestalt.css'

import Redirect from 'components/Redirect'
import Price from 'components/Price'
import Category from 'components/Category'
import ListingBadge from 'components/ListingBadge'
import imageSizes from './imageSizes.json'

import withGrowthRewards from 'hoc/withGrowthRewards'

function altClick(e) {
  return e.button === 0 && !e.shiftKey && !e.metaKey && !e.ctrlKey && !e.altKey
}

const Item = ({ data }) => {
  const a = data
  const [redirect, setRedirect] = useState()
  if (redirect) {
    return <Redirect to={redirect} push />
  }
  const url = get(a, 'media[0].urlExpanded', '')
  let width, height
  const split = url.split('/')
  if (split.length) {
    ;({ width, height } = imageSizes[split[split.length - 1]])
  }

  return (
    <div
      key={a.id}
      className="listing-card masonry"
      onClick={e => {
        if (altClick(e)) {
          setRedirect(`/listing/${a.id}`)
        } else if (e.target.tagName !== 'A') {
          window.open(`#/listing/${a.id}`, '_blank')
        }
      }}
    >
      <Box>
        {url ? (
          <Image
            alt="img"
            src={url}
            naturalWidth={width || 400}
            naturalHeight={height || 300}
          />
        ) : (
          <div className="main-pic empty" />
        )}
      </Box>
      <div className="header">
        <div className="category">
          <Category listing={a} showPrimary={false} />
        </div>
        <ListingBadge status={a.status} featured={a.featured} />
      </div>
      <h5>
        <a href={`#/listing/${a.id}`}>{a.title}</a>
      </h5>
      {a.__typename === 'AnnouncementListing' ? null : (
        <div className="price d-flex align-items-center">
          <Price listing={a} descriptor />
        </div>
      )}
    </div>
  )
}

const ListingCards = ({ listings, onLoad }) => {
  if (!listings) return null

  return (
    <div className={`listings-masonry`}>
      <Masonry
        comp={Item}
        items={listings}
        loadItems={() => onLoad()}
        minCols={2}
        flexible={true}
        gutterWidth={20}
        virtualize={true}
        scrollContainer={() => window}
      />
    </div>
  )
}

export default withGrowthRewards(ListingCards)

require('react-styl')(`
  .listing-card.masonry
    margin-top: 0
    img
      border-radius: 10px
`)
