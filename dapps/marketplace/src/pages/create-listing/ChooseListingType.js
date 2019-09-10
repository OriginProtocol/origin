import React, { useState } from 'react'
import get from 'lodash/get'
import { fbt } from 'fbt-runtime'
import Categories from '@origin/graphql/src/constants/Categories'

import Redirect from 'components/Redirect'
import DownloadApp from 'components/DownloadApp'
import withCreatorConfig from 'hoc/withCreatorConfig'
import withWallet from 'hoc/withWallet'

const CategoriesEnum = require('Categories$FbtEnum') // Localized category names

const ChooseListingType = props => {
  const isForceType = get(props, 'creatorConfig.forceType', false)
  const [valid, setValid] = useState(false)

  if (valid || isForceType) {
    return <Redirect to={props.next} push />
  }

  const isEdit = props.listing.id ? true : false
  return (
    <>
      <h1 className="d-none d-md-block">
        {isEdit ? (
          <fbt desc="chooselistingtype.letsupdate">
            Let’s update your listing
          </fbt>
        ) : (
          <fbt desc="chooseListingType.createListing">Create a Listing</fbt>
        )}
      </h1>
      <div className="step-description">
        {isEdit
          ? fbt(`Update listing type`, `CreateListing.updateListingType`)
          : fbt(
              `What type of listing do you want to create?`,
              `CreateListing.typeOfListing`
            )}
      </div>

      <div className="row">
        <div className="col-md-8">
          <div className="choose-category">
            {Categories.root.map(([categoryId]) => (
              <a
                key={categoryId}
                href={`#category-${categoryId.split('.')[1]}`}
                className="category"
                onClick={e => {
                  e.preventDefault()
                  props.onChange({ ...props.listing, category: categoryId })
                  setValid(true)
                }}
              >
                <div className={`category-ico ${categoryId.split('.')[1]}`} />
                <fbt desc="category">
                  <fbt:enum enum-range={CategoriesEnum} value={categoryId} />
                </fbt>
              </a>
            ))}
          </div>
        </div>
        {props.walletType !== 'Mobile' && props.walletType !== 'Origin Wallet' && (
          <div className="col-md-4">
            <div className="gray-box d-none d-md-block">
              <DownloadApp />
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default withCreatorConfig(withWallet(ChooseListingType))

require('react-styl')(`
  .category-ico
    border-radius: 50%
    background-color: var(--light)
    background-repeat: no-repeat
    background-size: 60%
    background-position: center
    width: 3.5rem
    height: 3.5rem
    &.forSale
      background-color: #7a26f3
      background-image: url(images/listing-types/sale-icon.svg)
      background-position: 62% 60%
    &.forRent
      background-color: #00d693
      background-image: url(images/listing-types/rent-icon.svg)
    &.services
      background-color: #fec100
      background-image: url(images/listing-types/services-icon.svg)
      background-size: 66%
      background-position: 50% 40%
    &.announcements
      background-color: #007fff
      background-image: url(images/listing-types/announcements-icon.svg)
      background-size: 66%
      background-position: 50%

  .create-listing
    h1
      font-size: 40px
      margin-bottom: 0.5rem
    .choose-category
      border: 1px solid var(--light)
      padding: 1.5rem
      align-items: center
      display: flex
      flex-direction: column
      border-radius: 5px
      max-width: 600px
      .category
        display: flex
        width: 100%
        color: #000000
        &:not(:last-of-type)
          border-bottom: 1px solid var(--light)
        &:hover
          opacity: 0.75
        font-size: 24px
        font-weight: bold
        align-items: center
        line-height: 1
        padding: 1.5rem 0
        max-width: 25rem
        .category-ico
          margin-right: 1rem
          width: 3.5rem
          height: 3.5rem

  @media (max-width: 767.98px)
    .create-listing
      h1
        font-size: 1.5rem
      .choose-category
        border: unset
        padding: unset
        .category
          font-size: 18px
          padding: 1.25rem 0
`)
