import React, { Component } from 'react'
import Categories from '@origin/graphql/src/constants/Categories'
import pick from 'lodash/pick'
import { fbt } from 'fbt-runtime'

import Steps from 'components/Steps'
import Redirect from 'components/Redirect'
import Wallet from 'components/Wallet'

import { formInput, formFeedback } from 'utils/formHelpers'

class ChooseListingType extends Component {
  constructor(props) {
    super(props)
    this.state = { ...props.listing, fields: Object.keys(props.listing) }
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.category !== this.state.category && this.catRef) {
      this.catRef.focus()
    }
  }

  render() {
    const isEdit = this.props.listing.id ? true : false
    if (this.state.valid) {
      return <Redirect to={this.props.next} push />
    }

    const input = formInput(this.state, state => this.setState(state))
    const Feedback = formFeedback(this.state)

    const Category = (id, title) => {
      const active = this.state.category === id
      const cls = id.split('.')[1]
      return (
        <div
          key={id}
          className={`category ${cls} ${active ? 'active' : 'inactive'}`}
          onClick={() => {
            if (active) return
            this.setState({ category: id, subCategory: '' })
          }}
        >
          <div className="title">{title}</div>
          {!active ? null : (
            <div className="sub-cat">
              <select {...input('subCategory')} ref={r => (this.catRef = r)}>
                <option value="">
                  <fbt desc="chooselistingtype.select">Select</fbt>
                </option>
                {Categories[id].map(([id, title]) => (
                  <option key={id} value={id}>
                    {title}
                  </option>
                ))}
              </select>
              {Feedback('subCategory')}
            </div>
          )}
        </div>
      )
    }

    return (
      <div className="row">
        <div className="col-md-8">
          <div className="create-listing-choose-listingtype">
            {!isEdit ? null : (
              <h2>
                <fbt desc="chooselistingtype.letsupdate">
                  Let’s update your listing
                </fbt>
              </h2>
            )}
            <div className="wrap">
              <div className="step" />
              <div className="step-description">
                {isEdit
                  ? fbt(
                      `Update listing type`,
                      `chooselistingtype.update-listing-type`
                    )
                  : fbt(
                      `What type of listing do you want to create?`,
                      `chooselistingtype.create-listing-type`
                    )}
              </div>
              <Steps steps={1} step={0} />
              <form
                onSubmit={e => {
                  e.preventDefault()
                  this.validate()
                }}
              >
                {Categories.root.map(([schema, title]) =>
                  Category(schema, title)
                )}
                <div className="actions">
                  <button
                    type="submit"
                    className={`btn btn-primary${
                      this.state.subCategory ? '' : ' disabled'
                    }`}
                    children={fbt('Continue', 'Continue')}
                  />
                </div>
              </form>
            </div>
          </div>
        </div>
        <div className="col-md-4 d-none d-md-block">
          <Wallet />
        </div>
      </div>
    )
  }

  validate() {
    const newState = {}

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

    const { category, subCategory } = this.state

    if (!subCategory) {
      newState.subCategoryError = 'Category is required'
    }

    newState.valid = Object.keys(newState).every(f => f.indexOf('Error') < 0)

    // Derive ListingType from category+subcategory
    let __typename = 'UnitListing'
    if (category === 'schema.announcements') {
      __typename = 'AnnouncementListing'
    } else if (localStorage.getItem('enableAllFractional')) {
      // TODO (Stan): Temporary hack to prevent hourly fractional being used
      // in production but can be tested and used by executing in console:
      //      localStorage.setItem('enableAllFractional', 'true');
      //  remove with:
      //      localStorage.removeItem('enableAllFractional');
      console.warn(
        'enableAllFractional is set: Using fractional listing types that will not validate with origin-js.'
      )
      if (
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
    } else if (
      category === 'schema.forRent' &&
      subCategory === 'schema.housing'
    ) {
      __typename = 'FractionalListing'
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

export default ChooseListingType

require('react-styl')(`
  .create-listing .create-listing-choose-listingtype
    max-width: 570px
    > .wrap
      max-width: 460px
    h2
      font-family: var(--heading-font)
      font-size: 40px
      font-weight: 200
      line-height: 1.25
    .category
      border: 1px solid var(--light)
      font-size: 24px
      font-weight: normal
      color: var(--dark)
      margin-bottom: 0.75rem
      border-radius: var(--default-radius);
      &.inactive
        cursor: pointer
      &.inactive:hover
        background-color: var(--pale-grey-eight)
      &.active
        color: var(--dark)
        border-color: #000
      .title
        display: flex
        align-items: center
        margin: 0.5rem 0
        &::before
          content: ""
          background-repeat: no-repeat
          background-size: contain
          background-position: center
          width: 8rem
          height: 5rem

      &.forSale .title::before
        background-image: url(images/create-listing/for-sale.svg)
        background-position: 1rem
      &.forRent .title::before
        background-image: url(images/create-listing/for-rent.svg)
        background-position: 1.9rem
      &.services .title::before
        background-image: url(images/create-listing/services.svg)
        background-position: 2rem
      &.announcements .title::before
        background-image: url(images/create-listing/annoucements.svg)
        background-position: 1rem
        background-size: 4rem

      .sub-cat
        padding: 0.5rem 1rem 1rem 1rem

    .actions
      justify-content: flex-end



  @media (max-width: 767.98px)
    .create-listing .create-listing-choose-listingtype
      h2
        font-size: 32px
        line-height: 1.25
      .category .title::before
        width: 7rem
        height: 4rem

      .actions
        justify-content: center
        margin-bottom: 2.5rem
`)
