import React, { useState } from 'react'
import get from 'lodash/get'
import { fbt } from 'fbt-runtime'
import Categories from '@origin/graphql/src/constants/Categories'

import Link from 'components/Link'
import Redirect from 'components/Redirect'
import DownloadApp from 'components/DownloadApp'
import withWallet from 'hoc/withWallet'

const CategoriesEnum = require('Categories$FbtEnum') // Localized category names

const hourlyFractional = [
  'schema.atvsUtvsSnowmobiles',
  'schema.bicycles',
  'schema.boats',
  'schema.carsTrucks',
  'schema.healthBeauty',
  'schema.heavyEquipment',
  'schema.householdItems',
  'schema.motorcyclesScooters',
  'schema.other',
  'schema.parking',
  'schema.tools'
]
const nightlyFractional = [
  'schema.appliances',
  'schema.babyKidStuff',
  'schema.cellPhones',
  'schema.clothingAccessories',
  'schema.computers',
  'schema.electronics',
  'schema.farmGarden',
  'schema.furniture',
  'schema.housing',
  'schema.jewelry',
  'schema.musicalInstruments',
  'schema.recreationalVehicles',
  'schema.sportingGoods',
  'schema.storage',
  'schema.toysGames',
  'schema.trailers',
  'schema.videoGaming'
]

function propsForType(category, subCategory) {
  // Derive ListingType from category+subcategory
  let __typename = 'UnitListing'
  if (category === 'schema.announcements') {
    __typename = 'AnnouncementListing'
  } else if (
    category === 'schema.forSale' &&
    subCategory === 'schema.giftCards'
  ) {
    __typename = 'GiftCardListing'
  } else if (category === 'schema.services') {
    __typename = 'ServiceListing'
  } else if (
    category === 'schema.forRent' &&
    nightlyFractional.includes(subCategory)
  ) {
    __typename = 'FractionalListing'
  } else if (
    category === 'schema.forRent' &&
    hourlyFractional.includes(subCategory)
  ) {
    __typename = 'FractionalHourlyListing'
  }

  return { __typename, category, subCategory }
}

const ChooseListingCategory = ({
  listing,
  prev,
  next,
  walletType,
  onChange
}) => {
  const [valid, setValid] = useState(false)
  const categoryId = get(listing, 'category')
  const categoryShortId = categoryId.split('.')[1]

  if (!categoryId) {
    return <Redirect to={prev} />
  }
  if (valid) {
    return <Redirect to={next} />
  }

  return (
    <>
      <h1>
        <Link to={prev} className="back d-md-none" />
        <fbt desc="category">
          <fbt:enum enum-range={CategoriesEnum} value={categoryId} />
        </fbt>
      </h1>

      <div className="row">
        <div className="col-md-8">
          <div className="listing-step choose-sub-category">
            <div className={`category-ico ${categoryShortId}`} />
            <div className="sub-categories">
              {Categories[categoryId].map(([subcategoryId]) => (
                <a
                  onClick={e => {
                    e.preventDefault()
                    onChange({
                      ...listing,
                      ...propsForType(listing.category, subcategoryId)
                    })
                    setValid(true)
                  }}
                  href="#"
                  key={subcategoryId}
                  className="sub-category"
                >
                  <fbt desc="category">
                    <fbt:enum
                      enum-range={CategoriesEnum}
                      value={subcategoryId}
                    />
                  </fbt>
                </a>
              ))}
            </div>

            <div className="actions d-none d-md-inline-block mt-4">
              <Link className="btn btn-outline-primary" to={prev}>
                <fbt desc="back">Back</fbt>
              </Link>
            </div>
          </div>
        </div>
        {walletType !== 'Mobile' && walletType !== 'Origin Wallet' && (
          <div className="col-md-4">
            <div className="gray-box">
              <DownloadApp />
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default withWallet(ChooseListingCategory)

require('react-styl')(`
  .create-listing
    .choose-sub-category
      .category-ico
        width: 4.5rem
        height: 4.5rem
        margin-top: 1rem
        margin-bottom: 1rem
      .sub-category
        display: flex
        width: 100%
        color: #000000
        &:not(:last-of-type)
          border-bottom: 1px solid var(--light)
        &:hover
          opacity: 0.75
        font-size: 18px
        font-weight: bold
        line-height: 1
        padding: 1.25rem 0

  @media (min-width: 767.98px)
    .create-listing
      .category-ico
        width: 6rem
        height: 6rem
      .sub-category
        width: unset
        max-width: 25rem
        min-width: 15rem

  @media (max-width: 767.98px)
    .create-listing
      h1
        font-size: 24px
        text-align: center
        position: relative
        a.back
          position: absolute
          left: 0
          width: 1.25rem
          height: 1.25rem
          top: 0.5rem
          background-image: url('images/caret-grey.svg')
          background-size: 100%
          background-position: center
          transform: rotateZ(270deg)
          background-repeat: no-repeat

      .sub-categories
        width: 100%

`)
