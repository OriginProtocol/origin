import React, { Component } from 'react'
import { fbt } from 'fbt-runtime'
import omit from 'lodash/omit'

import Steps from 'components/Steps'
import Wallet from 'components/Wallet'
import ImagePicker from 'components/ImagePicker'
import Redirect from 'components/Redirect'
import Link from 'components/Link'
import CurrencySelect from 'components/CurrencySelect'
import countryCodeMapping from '@origin/graphql/src/constants/CountryCodes'

import { Currencies, CurrenciesByCountryCode } from 'constants/Currencies'


import { formInput, formFeedback } from 'utils/formHelpers'

import PricingChooser from '../_PricingChooser'

class Details extends Component {
  constructor(props) {
    super(props)
    this.state = omit(props.listing, 'valid')
  }

  componentDidMount() {
    if (this.titleInput) {
      this.titleInput.focus()
    }
  }

  render() {
    if (this.state.valid) {
      return <Redirect to={this.props.next} push />
    }

    const input = formInput(this.state, state => this.setState(state))
    const Feedback = formFeedback(this.state)
    const isMulti = Number(this.state.quantity || 0) > 1

    const issuingCountrySelect = Object.keys(CurrenciesByCountryCode)

    const retailerSelect = [
      'Topshop',
      'Grinder\'s Above & Beyond',
      'Kiehl\'s',
      'Club Monaco',
      'Staples',
      'Sun and Ski Sports',
      'Einstein Bros & Noah\'s Bagels',
      'Regal Entertainment Group',
      'O\'Charley\'s',
      'Burke Williams Spa',
      'Calvin Klein',
      'Johnston and Murphy',
      'Champs Sports',
      'Bare Minerals',
      'Watch Station International',
      'Build-A-Bear',
      'Crate & Barrel',
      'Lettuce Entertain You',
      'Naturalizer Shoes',
      'Hautelook',
      'Nordstrom',
      'Skechers',
      'Foot Locker',
      'L.L. Bean',
      'Land of Nod',
      'Abercrombie & Fitch',
      'Brighton',
      'American Airlines',
      'Sally Beauty Supply',
      'Lids/Hat World',
      'Gap',
      'Catherines',
      'Zara',
      'Fairmont Hotels',
      'Texas Roadhouse',
      'AutoZone',
      'Lone Star Steakhouse',
      'Stubhub',
      'Mission Inn',
      'Valentinos Restaurants',
      'Roy\'s Hawaiian Fusion',
      'Athleta',
      'Lululemon Athletica',
      'Splendid',
      'Domino\'s Pizza',
      'JCPenney',
      'Yard House',
      '1-800-Flowers.com',
      'ALDO',
      'Gordon Biersch',
      'Restoration Hardware',
      'Panera Bread',
      'Brylane Home',
      'Hotels.com',
      'Zales',
      'Lady Foot Locker',
      'Carhartt',
      'Old Spaghetti Factory',
      'Old Navy',
      'Brinker Restaurants',
      'Alice and Olivia',
      'Piercing Pagoda',
      'Quiznos',
      'Ruby Tuesday',
      'Bebe',
      'Eddie Bauer',
      'Playstation Network',
      'IHOP',
      'RegencyTheaters',
      'Harley Davidson',
      'T.J. Maxx',
      'DC Shoes',
      'Famous Footwear',
      'Boot Barn',
      'Rue 21',
      '1-800-Baskets',
      'True Religion Brand Jeans',
      'Raymour and Flanigan',
      'Pappas Restaurants',
      'Landry\'s',
      'Elephant Bar Restaurant',
      'Subway',
      'Microsoft Xbox',
      'The Art of Shaving',
      'Hard Rock Cafe',
      'Starbucks',
      'New Balance',
      'Baby Gap',
      'Pier 1 Imports',
      'Belk',
      'Alamo Drafthouse Cinema',
      'Kohl\'s',
      'Saltgrass Steak House',
      'Dean & DeLuca',
      'Cold Stone Creamery',
      'Active',
      'Fuddruckers',
      'Fandango',
      'Noah\'s Bagels',
      'Pei Wei Asian Diner',
      'Sur La Table',
      'Restaurants Unlimited',
      'Sephora',
      'BedandBreakfast.com',
      'Chili\'s',
      'Worldwide Golf Shops',
      'Olive Garden',
      'Bed Bath and Beyond',
      'Bliss Spa',
      'Barney\'s New York',
      'All Saints',
      'Petco',
      'BOSE',
      'Tommy Bahama',
      'California Pizza Kitchen',
      'Seasons 52',
      'P.F. Chang\'s',
      'Performance Bicycle',
      'Gap Options',
      'Fleming\'s Steakhouse',
      'Logan\'s Roadhouse',
      'Scrubs & Beyond',
      'AirBnB',
      'Menchie\'s Frozen Yogurt',
      'Aeropostale',
      'Alex and Ani',
      'Rooms To Go',
      'Z Gallerie',
      'Allen Edmonds',
      'Busken Bakery',
      'Soma',
      'MLB.com',
      'Chico\'s',
      'SpaFinder',
      'Carrabba\'s Italian Grill',
      'ULTA',
      'World of Beer',
      'Don Pablos',
      'Google Play',
      'The Company Store',
      'TGI Friday\'s',
      'Oceanaire Restaurants',
      'Damon\'s Grill',
      'Pinstripes',
      'Texas de Brazil',
      'Macy\'s',
      'Big Lots',
      'Omaha Steaks',
      'Cavender\'s',
      'Atria\'s Restaurant',
      'Columbia Sportswear',
      'Caribou Coffee',
      'Old Chicago',
      'Boscov\'s',
      'Jos. A. Bank',
      'Old Country Buffet',
      'Academy Sports & Outdoors',
      'West Elm',
      'REI',
      'Justice',
      'Maggiano\'s Little Italy',
      'Coach',
      'MAC Cosmetics',
      'Marriott',
      'Blick Art Materials',
      'Willie G\'s',
      'Delia\'s',
      'NBA Store',
      'PGA Tour Superstore',
      'Charming Charlie',
      'Orchard Supply Hardware',
      'Bonanza Steakhouse',
      'Land\'s End',
      'Marcus Theatres',
      'Grotto/La Griglia',
      'Cabela\'s',
      'Think Geek',
      'Burger King',
      'Bath & Body Works',
      'Eddie V\'s Prime Seafood',
      'Dell',
      'First Watch Cafe',
      'Carter\'s',
      'Callaway Golf',
      'Honey Baked Ham',
      'Modell\'s Sporting Goods',
      'Pandora',
      'Children\'s Place',
      'Claim Jumper Restaurants',
      'Chipotle',
      'Harry and David Gifts',
      'Tumi',
      'Southwest Airlines',
      'Piada Italian Street Food',
      'Williams-Sonoma',
      'Ralph Lauren',
      'See\'s Candies',
      'Dillard\'s',
      'Cheesecake Factory',
      'Capital Grille',
      'Yogurtland',
      'Apple Store (not iTunes)',
      'Lacoste',
      'Jiffy Lube',
      'Under Armour',
      'Saks Fifth Avenue',
      'Brooks Brothers',
      'Red Door Spa',
      'The Walking Company',
      'BJ\'s Restaurant and Brewhouse',
      'Quaker Steak & Lube Restaurant',
      'Michaels',
      'Abercrombie Kids',
      'Cole Haan',
      'Vineyard Vines',
      'RVCA',
      'Lucille\'s BBQ',
      'Spaghetti Works',
      'Elie Tahari',
      'Macaroni Grill',
      'Brookstone',
      'Lucky Brand Jeans',
      'Kirkland\'s',
      'Nine West',
      'Spaghetti Warehouse',
      'DSW',
      'Bass Pro Shops',
      'Sam\'s Club',
      'Torrid',
      'Olga\'s Kitchen',
      'Express',
      'Bow Tie Cinemas',
      'Buckhead Mountain Grill Restaurant',
      'Field & Stream',
      'Pottery Barn',
      'Pizzeria Uno',
      'Pottery Barn Kids',
      'Altar\'d State',
      'Vera Bradley',
      'Design Within Reach',
      'AMC Theatres',
      'Francesca\'s',
      'Kincaid\'s Restaurants',
      'Best Buy',
      'Aerosoles',
      'Advance Auto Parts',
      'Supercuts',
      'Vanity',
      'Picture People',
      'Tully\'s Coffee',
      'Mandee',
      'Kings Isle Pirate',
      'Burberry',
      'Bonefish Grill',
      'Banana Republic',
      '16 Handles',
      'American Eagle Outfitters',
      'Spa & Wellness ',
      'Hobby Town',
      'Hollister',
      'Casual Male XL',
      'Aquarium Restaurants',
      'Rock Bottom Restaurant Brewery',
      'White House Black Market',
      'Men\'s Wearhouse',
      'Tommy Hilfiger (Online only)',
      'Netflix',
      'Outback Steakhouse',
      'CB2',
      'Miguel\'s Jr.',
      'LongHorn Steakhouse',
      'Tilly\'s',
      'Walmart',
      'Taco Bell',
      'Pac Sun',
      'Uno Chicago Grill',
      'Sears',
      'Sperry',
      'Yogurt Mountain',
      'Destination XL',
      'Max & Erma\'s Restaurant',
      'Uber',
      'Steve Madden Shoes',
      'Legal Sea Foods',
      'Cato',
      'CraftWorks Restaurants & Breweries',
      'The North Face',
      'Applebee\'s',
      'Filson',
      'Forever 21',
      'Nike',
      'Lane Bryant',
      'Beau Jo\'s',
      'Pinkberry',
      'Barnes & Noble',
      'Blair',
      'Tiffany & Co.',
      'Bealls Outlet (Florida)',
      'Lord & Taylor',
      'Smashburger',
      'Target',
      'Madewell',
      'Patagonia',
      'Buca di Beppo',
      'Cameron Mitchell Restaurants',
      'Texas Corral',
      'Victoria\'s Secret',
      'Scene 75 Entertainment Center',
      'Carson Pirie Scott',
      'Pet Supermarket',
      'Harbor Freight',
      'Smokey Bones',
      'Sunglass Hut',
      'Apple iTunes',
      'Kona Grill',
      'Destination Maternity',
      'Hobby Lobby',
      'Peets Coffee and Tea',
      'On the Border',
      'BevMo',
      'Guitar Center',
      'Levi\'s',
      'iPic Theaters',
      'Bob\'s Discount Furniture',
      'NFLShop',
      'Morton\'s the Steakhouse',
      'Aerie',
      'Toms',
      'Rainforest Cafe',
      'A Pea in the Pod',
      'Bob Evans Restaurant',
      'Taco Time',
      'Celebrity Cruises',
      'PotBelly Sandwich Shop',
      'Darden Restaurants',
      'Safeway',
      'Bloomin\' Brands',
      'Clark\'s Shoes',
      'Wilson\'s Leather',
      'Janie and Jack',
      'Motherhood Maternity',
    ]

    return (
      <div className="row">
        <div className="col-md-8">
          <div className="create-listing-step-2">
            <div className="wrap">
              <div className="step">
                <fbt desc="create.step">
                  Step
                  <fbt:param name="step">{this.props.step}</fbt:param>
                </fbt>
              </div>
              <div className="step-description">
                <fbt desc="create.details.title">Provide listing details</fbt>
              </div>
              <Steps steps={this.props.steps} step={this.props.step} />

              <form
                onSubmit={e => {
                  e.preventDefault()
                  this.validate()
                }}
              >
                {this.state.valid !== false ? null : (
                  <div className="alert alert-danger">
                    <fbt desc="fix errors">Please fix the errors below...</fbt>
                  </div>
                )}

{/* TODO: auto-gen title

                <div className="form-group">
                  <label>
                    <fbt desc="create.Title">Title</fbt>
                  </label>
                  <input {...input('title')} ref={r => (this.titleInput = r)} />
                  {Feedback('title')}
                </div>
*/ }

                <div className="form-group">
                  <label className="mb-0">
                    <fbt desc="create.details.description">Notes</fbt>
                  </label>
                  <textarea {...input('description')} />
                  {Feedback('description')}
                </div>

                {/* BEGIN Gift card specific code */}

                <div className="form-group">
                  <label>
                    <fbt desc="create.details.quantity">Quantity</fbt>
                  </label>
                  <input {...input('quantity')} />
                  {Feedback('quantity')}
                </div>

                <div className="form-group">
                  <label>
                    <fbt desc="create.details.retailer">Retailer</fbt>
                  </label>
                  <select
                    className="form-control form-control-lg"
                    value={ this.state.retailer }
                    onChange={e => {
                      this.setState({ retailer: e.target.value })
                    }}
                  >
                    {retailerSelect.map((name) => (
                      <option
                        key={name}
                        value={name}
                      >
                        {name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>
                    <fbt desc="create.details.issuingCountry">Issuing Country</fbt>
                  </label>
                  <select
                    className="form-control form-control-lg"
                    value={ this.state.issuingCountry }
                    onChange={e => {
                      this.setState({ issuingCountry: e.target.value })
                    }}
                  >
                    {issuingCountrySelect.map((countryCode) => (
                      <option
                        key={countryCode}
                        value={countryCode}
                      >
                        {countryCodeMapping['en'][countryCode]}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="mb-0">
                    <fbt desc="create.details.cardAmount">Amount on Card</fbt>
                  </label>
                  <div className="with-symbol" style={{ maxWidth: 270 }}>
                    <input {...input('cardAmount')} />
                    <div class="dropdown currency-select-dropdown">
                      <span class="hover" data-content={CurrenciesByCountryCode[this.state.issuingCountry][2]}>
                        {CurrenciesByCountryCode[this.state.issuingCountry][1]}
                      </span>
                    </div>
                  </div>



                  {Feedback('cardAmount')}
                </div>

                <PricingChooser {...input('acceptedTokens', true)}>
                  <div className="form-group">
                    <label>
                      {!isMulti && <fbt desc="price-per-unit">Price</fbt>}
                      {isMulti && (
                        <fbt desc="price-per-unit">Price (per card)</fbt>
                      )}
                    </label>
                    <div className="with-symbol" style={{ maxWidth: 270 }}>
                      <input {...input('price')} />
                      <CurrencySelect {...input('currency', true)} />
                    </div>
                    {Feedback('price')}
                    <div className="help-text price">
                      <fbt desc="create.details.help-text.price">
                        Price is an approximation of what you will receive.
                      </fbt>
                      <a
                        href="#/about/payments"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        &nbsp;
                        <fbt desc="create.details.help-text.price.more">
                          Learn More
                        </fbt>
                      </a>
                    </div>
                  </div>
                </PricingChooser>

                {/* END Gift Card  specific code */}

                <div className="form-group">
                  <label>
                    <fbt desc="create.select-photos">Select photos</fbt>
                  </label>
                  <ImagePicker
                    images={this.state.media}
                    onChange={media => this.setState({ media })}
                  >
                    <div className="add-photos">
                      <fbt desc="create.select-photos">Select photos</fbt>
                    </div>
                  </ImagePicker>
                  <ul className="help-text photo-help list-unstyled">
                    <fbt desc="create.listing.photos.help">
                      <li>
                        Hold down &apos;command&apos; (⌘) to select multiple
                        images.
                      </li>
                      <li>Maximum 10 images per listing.</li>
                      <li>
                        First image will be featured - drag and drop images to
                        reorder.
                      </li>
                      <li>Recommended aspect ratio is 4:3</li>
                    </fbt>
                  </ul>
                </div>

                <div className="actions">
                  <Link
                    className="btn btn-outline-primary"
                    to={this.props.prev}
                  >
                    <fbt desc="back">Back</fbt>
                  </Link>
                  <button type="submit" className="btn btn-primary">
                    <fbt desc="continue">Continue</fbt>
                  </button>
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

// not working
    // this.setState({ title: `CURRENCY ${this.state.cardAmount} ${this.state.retailer} Gift Card` })

    // if (!this.state.title) {
    //   newState.titleError = fbt(
    //     'Title is required',
    //     'create.error.Title is required'
    //   )
    // } else if (this.state.title.length < 3) {
    //   newState.titleError = fbt(
    //     'Title is too short',
    //     'create.error.Title is too short'
    //   )
    // } else if (this.state.title.length > 100) {
    //   // Limit from origin-validator/src/schemas/listing.json
    //   newState.titleError = fbt(
    //     'Title is too long',
    //     'create.error.Title is too long'
    //   )
    // }

    if (!this.state.description) {
      newState.descriptionError = fbt(
        'Description is required',
        'create.error.Description is required'
      )
    } else if (this.state.description.length < 10) {
      newState.descriptionError = fbt(
        'Description is too short',
        'create.error.Description is too short'
      )
    } else if (this.state.description.length > 1024) {
      // Limit from origin-validator/src/schemas/listing.json
      newState.descriptionError = fbt(
        'Description is too long',
        'create.error.Description is too long'
      )
    }

    if (!this.state.price) {
      newState.priceError = fbt('Price is required', 'Price is required')
    } else if (!this.state.price.match(/^-?[0-9.]+$/)) {
      newState.priceError = fbt(
        'Price must be a number',
        'Price must be a number'
      )
    } else if (Number(this.state.price) <= 0) {
      newState.priceError = fbt(
        'Price must be greater than zero',
        'Price must be greater than zero'
      )
    }

    console.log(newState)
    newState.valid = Object.keys(newState).every(f => f.indexOf('Error') < 0)

    if (!newState.valid) {
      window.scrollTo(0, 0)
    } else if (this.props.onChange) {
      this.props.onChange(this.state)
    }
    this.setState(newState)
    return newState.valid
  }
}

export default Details

require('react-styl')(`
  .create-listing .create-listing-step-2 .pricing-chooser
    .help-text
      .help-icon
        margin-left: auto
`)
