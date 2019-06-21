import React, { Component } from 'react'
import Categories from '@origin/graphql/src/constants/Categories'
import pick from 'lodash/pick'
import { fbt } from 'fbt-runtime'

import Redirect from 'components/Redirect'
import withCreatorConfig from 'hoc/withCreatorConfig'

const CategoriesEnum = require('Categories$FbtEnum') // Localized category names

// import { formInput, formFeedback } from 'utils/formHelpers'

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

class ChooseListingType extends Component {
  constructor(props) {
    super(props)
    this.state = { ...props.listing, fields: Object.keys(props.listing) }
  }

  render() {
    const isForceType =
      this.props.creatorConfig && this.props.creatorConfig.forceType
    if (this.state.valid || isForceType) {
      return <Redirect to={this.props.next} push />
    }

    const isEdit = this.props.listing.id ? true : false
    // const input = formInput(this.state, state => this.setState(state))
    // const Feedback = formFeedback(this.state)

    // const Category = categoryId => {
    //   const active = this.state.category === categoryId
    //   const cls = categoryId.split('.')[1]
    //   return (
    //     <div
    //       key={categoryId}
    //       className={`category ${cls} ${active ? 'active' : 'inactive'}`}
    //       onClick={() => {
    //         if (active) return
    //         this.setState({ category: categoryId, subCategory: '' })
    //       }}
    //     >
    //       <div className="title">
    //         <fbt desc="category">
    //           <fbt:enum enum-range={CategoriesEnum} value={categoryId} />
    //         </fbt>
    //       </div>
    //       {!active ? null : (
    //         <div className="sub-cat">
    //           <select {...input('subCategory')} ref={r => (this.catRef = r)}>
    //             <option value="">
    //               <fbt desc="select">Select</fbt>
    //             </option>
    //             {Categories[categoryId].map(([subcategoryId]) => (
    //               <option key={subcategoryId} value={subcategoryId}>
    //                 <fbt desc="category">
    //                   {/* Localized subcategory name */}
    //                   <fbt:enum
    //                     enum-range={CategoriesEnum}
    //                     value={subcategoryId}
    //                   />
    //                 </fbt>
    //               </option>
    //             ))}
    //           </select>
    //           {Feedback('subCategory')}
    //         </div>
    //       )}
    //     </div>
    //   )
    // }

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
                  className={`category ${categoryId.split('.')[1]}`}
                  onClick={e => e.preventDefault()}
                >
                  <fbt desc="category">
                    <fbt:enum enum-range={CategoriesEnum} value={categoryId} />
                  </fbt>
                </a>
              ))}
            </div>
          </div>
          <div className="col-md-4">
            <div className="gray-box" />
          </div>
        </div>
      </>
    )
  }

  validate() {
    const newState = {}

    const { category, subCategory } = this.state

    if (!subCategory) {
      newState.subCategoryError = fbt(
        'Category is required',
        'Category is required'
      )
    }

    newState.valid = Object.keys(newState).every(f => f.indexOf('Error') < 0)

    // Derive ListingType from category+subcategory
    let __typename = 'UnitListing'
    if (category === 'schema.announcements') {
      __typename = 'AnnouncementListing'
    } else if (
      category === 'schema.forSale' &&
      subCategory === 'schema.giftCards'
    ) {
      __typename = 'GiftCardListing'
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

    if (!newState.valid) {
      window.scrollTo(0, 0)
    } else if (this.props.onChange) {
      this.props.onChange({
        ...pick(this.state, this.state.fields),
        __typename
      })
    }

    this.setState(newState)
    return newState.valid
  }
}

export default withCreatorConfig(ChooseListingType)

require('react-styl')(`
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
        &::before
          content: ""
          width: 3.5rem
          height: 3.5rem
          margin-right: 1rem
          border-radius: 50%
          background-color: var(--light)
          background-repeat: no-repeat
          background-size: 60%
          background-position: center
        &.forSale::before
          background-color: #7a26f3
          background-image: url(images/listing-types/sale-icon.svg)
          background-position: 62% 60%
        &.forRent::before
          background-color: #00d693
          background-image: url(images/listing-types/rent-icon.svg)
        &.services::before
          background-color: #fec100
          background-image: url(images/listing-types/services-icon.svg)
          background-size: 66%
          background-position: 50% 40%
        &.announcements::before
          background-color: #007fff

  @media (max-width: 767.98px)
    .create-listing
      .step-description
        font-size: 16px
      .choose-category
        border: unset
        padding: unset
        .category
          font-size: 18px
          padding: 1.25rem 0
          &::before
            width: 2.25rem
            height: 2.25rem
            margin-right: 0.75rem

`)
