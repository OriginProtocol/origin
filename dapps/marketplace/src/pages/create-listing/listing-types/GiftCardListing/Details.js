import React, { Component } from 'react'
import { fbt } from 'fbt-runtime'
import omit from 'lodash/omit'

import Steps from 'components/Steps'
import Wallet from 'components/Wallet'
import ImagePicker from 'components/ImagePicker'
import Redirect from 'components/Redirect'
import Link from 'components/Link'
import CurrencySelect from 'components/CurrencySelect'

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

    const retailerSelect = [
      ['1', 'Topshop'],
      ['2', 'Grinder\'s Above & Beyond'],
      ['3', 'Kiehl\'s'],
      ['4', 'Club Monaco'],
      ['5', 'Staples'],
      ['6', 'Sun and Ski Sports'],
      ['7', 'Einstein Bros & Noah\'s Bagels'],
      ['8', 'Regal Entertainment Group'],
      ['9', 'O\'Charley\'s'],
      ['10', 'Burke Williams Spa'],
      ['11', 'Calvin Klein'],
      ['12', 'Johnston and Murphy'],
      ['13', 'Champs Sports'],
      ['14', 'Bare Minerals'],
      ['15', 'Watch Station International'],
      ['16', 'Build-A-Bear'],
      ['17', 'Crate & Barrel'],
      ['18', 'Lettuce Entertain You'],
      ['19', 'Naturalizer Shoes'],
      ['20', 'Hautelook'],
      ['21', 'Nordstrom'],
      ['22', 'Skechers'],
      ['23', 'Foot Locker'],
      ['24', 'L.L. Bean'],
      ['25', 'Land of Nod'],
      ['26', 'Abercrombie & Fitch'],
      ['27', 'Brighton'],
      ['28', 'American Airlines'],
      ['29', 'Sally Beauty Supply'],
      ['30', 'Lids/Hat World'],
      ['31', 'Gap'],
      ['32', 'Catherines'],
      ['33', 'Zara'],
      ['34', 'Fairmont Hotels'],
      ['35', 'Texas Roadhouse'],
      ['36', 'AutoZone'],
      ['37', 'Lone Star Steakhouse'],
      ['38', 'Stubhub'],
      ['39', 'Mission Inn'],
      ['40', 'Valentinos Restaurants'],
      ['41', 'Roy\'s Hawaiian Fusion'],
      ['42', 'Athleta'],
      ['43', 'Lululemon Athletica'],
      ['44', 'Splendid'],
      ['45', 'Domino\'s Pizza'],
      ['46', 'JCPenney'],
      ['47', 'Yard House'],
      ['48', '1-800-Flowers.com'],
      ['49', 'ALDO'],
      ['50', 'Gordon Biersch'],
      ['51', 'Restoration Hardware'],
      ['52', 'Panera Bread'],
      ['53', 'Brylane Home'],
      ['54', 'Hotels.com'],
      ['55', 'Zales'],
      ['56', 'Lady Foot Locker'],
      ['57', 'Carhartt'],
      ['58', 'Old Spaghetti Factory'],
      ['59', 'Old Navy'],
      ['60', 'Brinker Restaurants'],
      ['61', 'Alice and Olivia'],
      ['62', 'Piercing Pagoda'],
      ['63', 'Quiznos'],
      ['64', 'Ruby Tuesday'],
      ['65', 'Bebe'],
      ['66', 'Eddie Bauer'],
      ['67', 'Playstation Network'],
      ['68', 'IHOP'],
      ['69', 'RegencyTheaters'],
      ['70', 'Harley Davidson'],
      ['71', 'T.J. Maxx'],
      ['72', 'DC Shoes'],
      ['73', 'Famous Footwear'],
      ['74', 'Boot Barn'],
      ['75', 'Rue 21'],
      ['76', '1-800-Baskets'],
      ['77', 'True Religion Brand Jeans'],
      ['78', 'Raymour and Flanigan'],
      ['79', 'Pappas Restaurants'],
      ['80', 'Landry\'s'],
      ['81', 'Elephant Bar Restaurant'],
      ['82', 'Subway'],
      ['83', 'Microsoft Xbox'],
      ['84', 'The Art of Shaving'],
      ['85', 'Hard Rock Cafe'],
      ['86', 'Starbucks'],
      ['87', 'New Balance'],
      ['88', 'Baby Gap'],
      ['89', 'Pier 1 Imports'],
      ['90', 'Belk'],
      ['91', 'Alamo Drafthouse Cinema'],
      ['92', 'Kohl\'s'],
      ['93', 'Saltgrass Steak House'],
      ['94', 'Dean & DeLuca'],
      ['95', 'Cold Stone Creamery'],
      ['96', 'Active'],
      ['97', 'Fuddruckers'],
      ['98', 'Fandango'],
      ['99', 'Noah\'s Bagels'],
      ['100', 'Pei Wei Asian Diner'],
      ['101', 'Sur La Table'],
      ['102', 'Restaurants Unlimited'],
      ['103', 'Sephora'],
      ['104', 'BedandBreakfast.com'],
      ['105', 'Chili\'s'],
      ['106', 'Worldwide Golf Shops'],
      ['107', 'Olive Garden'],
      ['108', 'Bed Bath and Beyond'],
      ['109', 'Bliss Spa'],
      ['110', 'Barney\'s New York'],
      ['111', 'All Saints'],
      ['112', 'Petco'],
      ['113', 'BOSE'],
      ['114', 'Tommy Bahama'],
      ['115', 'California Pizza Kitchen'],
      ['116', 'Seasons 52'],
      ['117', 'P.F. Chang\'s'],
      ['118', 'Performance Bicycle'],
      ['119', 'Gap Options'],
      ['120', 'Fleming\'s Steakhouse'],
      ['121', 'Logan\'s Roadhouse'],
      ['122', 'Scrubs & Beyond'],
      ['123', 'AirBnB'],
      ['124', 'Menchie\'s Frozen Yogurt'],
      ['125', 'Aeropostale'],
      ['126', 'Alex and Ani'],
      ['127', 'Rooms To Go'],
      ['128', 'Z Gallerie'],
      ['129', 'Allen Edmonds'],
      ['130', 'Busken Bakery'],
      ['131', 'Soma'],
      ['132', 'MLB.com'],
      ['133', 'Chico\'s'],
      ['134', 'SpaFinder'],
      ['135', 'Carrabba\'s Italian Grill'],
      ['136', 'ULTA'],
      ['137', 'World of Beer'],
      ['138', 'Don Pablos'],
      ['139', 'Google Play'],
      ['140', 'The Company Store'],
      ['141', 'TGI Friday\'s'],
      ['142', 'Oceanaire Restaurants'],
      ['143', 'Damon\'s Grill'],
      ['144', 'Pinstripes'],
      ['145', 'Texas de Brazil'],
      ['146', 'Macy\'s'],
      ['147', 'Big Lots'],
      ['148', 'Omaha Steaks'],
      ['149', 'Cavender\'s'],
      ['150', 'Atria\'s Restaurant'],
      ['151', 'Columbia Sportswear'],
      ['152', 'Caribou Coffee'],
      ['153', 'Old Chicago'],
      ['154', 'Boscov\'s'],
      ['155', 'Jos. A. Bank'],
      ['156', 'Old Country Buffet'],
      ['157', 'Academy Sports & Outdoors'],
      ['158', 'West Elm'],
      ['159', 'REI'],
      ['160', 'Justice'],
      ['161', 'Maggiano\'s Little Italy'],
      ['162', 'Coach'],
      ['163', 'MAC Cosmetics'],
      ['164', 'Marriott'],
      ['165', 'Blick Art Materials'],
      ['166', 'Willie G\'s'],
      ['167', 'Delia\'s'],
      ['168', 'NBA Store'],
      ['169', 'PGA Tour Superstore'],
      ['170', 'Charming Charlie'],
      ['171', 'Orchard Supply Hardware'],
      ['172', 'Bonanza Steakhouse'],
      ['173', 'Land\'s End'],
      ['174', 'Marcus Theatres'],
      ['175', 'Grotto/La Griglia'],
      ['176', 'Cabela\'s'],
      ['177', 'Think Geek'],
      ['178', 'Burger King'],
      ['179', 'Bath & Body Works'],
      ['180', 'Eddie V\'s Prime Seafood'],
      ['181', 'Dell'],
      ['182', 'First Watch Cafe'],
      ['183', 'Carter\'s'],
      ['184', 'Callaway Golf'],
      ['185', 'Honey Baked Ham'],
      ['186', 'Modell\'s Sporting Goods'],
      ['187', 'Pandora'],
      ['188', 'Children\'s Place'],
      ['189', 'Claim Jumper Restaurants'],
      ['190', 'Chipotle'],
      ['191', 'Harry and David Gifts'],
      ['192', 'Tumi'],
      ['193', 'Southwest Airlines'],
      ['194', 'Piada Italian Street Food'],
      ['195', 'Williams-Sonoma'],
      ['196', 'Ralph Lauren'],
      ['197', 'See\'s Candies'],
      ['198', 'Dillard\'s'],
      ['199', 'Cheesecake Factory'],
      ['200', 'Capital Grille'],
      ['201', 'Yogurtland'],
      ['202', 'Apple Store (not iTunes)'],
      ['203', 'Lacoste'],
      ['204', 'Jiffy Lube'],
      ['205', 'Under Armour'],
      ['206', 'Saks Fifth Avenue'],
      ['207', 'Brooks Brothers'],
      ['208', 'Red Door Spa'],
      ['209', 'The Walking Company'],
      ['210', 'BJ\'s Restaurant and Brewhouse'],
      ['211', 'Quaker Steak & Lube Restaurant'],
      ['212', 'Michaels'],
      ['213', 'Abercrombie Kids'],
      ['214', 'Cole Haan'],
      ['215', 'Vineyard Vines'],
      ['216', 'RVCA'],
      ['217', 'Lucille\'s BBQ'],
      ['218', 'Spaghetti Works'],
      ['219', 'Elie Tahari'],
      ['220', 'Macaroni Grill'],
      ['221', 'Brookstone'],
      ['222', 'Lucky Brand Jeans'],
      ['223', 'Kirkland\'s'],
      ['224', 'Nine West'],
      ['225', 'Spaghetti Warehouse'],
      ['226', 'DSW'],
      ['227', 'Bass Pro Shops'],
      ['228', 'Sam\'s Club'],
      ['229', 'Torrid'],
      ['230', 'Olga\'s Kitchen'],
      ['231', 'Express'],
      ['232', 'Bow Tie Cinemas'],
      ['233', 'Buckhead Mountain Grill Restaurant'],
      ['234', 'Field & Stream'],
      ['235', 'Pottery Barn'],
      ['236', 'Pizzeria Uno'],
      ['237', 'Pottery Barn Kids'],
      ['238', 'Altar\'d State'],
      ['239', 'Vera Bradley'],
      ['240', 'Design Within Reach'],
      ['241', 'AMC Theatres'],
      ['242', 'Francesca\'s'],
      ['243', 'Kincaid\'s Restaurants'],
      ['244', 'Best Buy'],
      ['245', 'Aerosoles'],
      ['246', 'Advance Auto Parts'],
      ['247', 'Supercuts'],
      ['248', 'Vanity'],
      ['249', 'Picture People'],
      ['250', 'Tully\'s Coffee'],
      ['251', 'Mandee'],
      ['252', 'Kings Isle Pirate'],
      ['253', 'Burberry'],
      ['254', 'Bonefish Grill'],
      ['255', 'Banana Republic'],
      ['256', '16 Handles'],
      ['257', 'American Eagle Outfitters'],
      ['258', 'Spa & Wellness '],
      ['259', 'Hobby Town'],
      ['260', 'Hollister'],
      ['261', 'Casual Male XL'],
      ['262', 'Aquarium Restaurants'],
      ['263', 'Rock Bottom Restaurant Brewery'],
      ['264', 'White House Black Market'],
      ['265', 'Men\'s Wearhouse'],
      ['266', 'Tommy Hilfiger (Online only)'],
      ['267', 'Netflix'],
      ['268', 'Outback Steakhouse'],
      ['269', 'CB2'],
      ['270', 'Miguel\'s Jr.'],
      ['271', 'LongHorn Steakhouse'],
      ['272', 'Tilly\'s'],
      ['273', 'Walmart'],
      ['274', 'Taco Bell'],
      ['275', 'Pac Sun'],
      ['276', 'Uno Chicago Grill'],
      ['277', 'Sears'],
      ['278', 'Sperry'],
      ['279', 'Yogurt Mountain'],
      ['280', 'Destination XL'],
      ['281', 'Max & Erma\'s Restaurant'],
      ['282', 'Uber'],
      ['283', 'Steve Madden Shoes'],
      ['284', 'Legal Sea Foods'],
      ['285', 'Cato'],
      ['286', 'CraftWorks Restaurants & Breweries'],
      ['287', 'The North Face'],
      ['288', 'Applebee\'s'],
      ['289', 'Filson'],
      ['290', 'Forever 21'],
      ['291', 'Nike'],
      ['292', 'Lane Bryant'],
      ['293', 'Beau Jo\'s'],
      ['294', 'Pinkberry'],
      ['295', 'Barnes & Noble'],
      ['296', 'Blair'],
      ['297', 'Tiffany & Co.'],
      ['298', 'Bealls Outlet (Florida)'],
      ['299', 'Lord & Taylor'],
      ['300', 'Smashburger'],
      ['301', 'Target'],
      ['302', 'Madewell'],
      ['303', 'Patagonia'],
      ['304', 'Buca di Beppo'],
      ['305', 'Cameron Mitchell Restaurants'],
      ['306', 'Texas Corral'],
      ['307', 'Victoria\'s Secret'],
      ['308', 'Scene 75 Entertainment Center'],
      ['309', 'Carson Pirie Scott'],
      ['310', 'Pet Supermarket'],
      ['311', 'Harbor Freight'],
      ['312', 'Smokey Bones'],
      ['313', 'Sunglass Hut'],
      ['314', 'Apple iTunes'],
      ['315', 'Kona Grill'],
      ['316', 'Destination Maternity'],
      ['317', 'Hobby Lobby'],
      ['318', 'Peets Coffee and Tea'],
      ['319', 'On the Border'],
      ['320', 'BevMo'],
      ['321', 'Guitar Center'],
      ['322', 'Levi\'s'],
      ['323', 'iPic Theaters'],
      ['324', 'Bob\'s Discount Furniture'],
      ['325', 'NFLShop'],
      ['326', 'Morton\'s the Steakhouse'],
      ['327', 'Aerie'],
      ['328', 'Toms'],
      ['329', 'Rainforest Cafe'],
      ['330', 'A Pea in the Pod'],
      ['331', 'Bob Evans Restaurant'],
      ['332', 'Taco Time'],
      ['333', 'Celebrity Cruises'],
      ['334', 'PotBelly Sandwich Shop'],
      ['335', 'Darden Restaurants'],
      ['336', 'Safeway'],
      ['337', 'Bloomin\' Brands'],
      ['338', 'Clark\'s Shoes'],
      ['339', 'Wilson\'s Leather'],
      ['340', 'Janie and Jack'],
      ['341', 'Motherhood Maternity'],
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

{/* TODO: auto-gen title */ }

                <div className="form-group">
                  <label>
                    <fbt desc="create.Title">Title</fbt>
                  </label>
                  <input {...input('title')} ref={r => (this.titleInput = r)} />
                  {Feedback('title')}
                </div>

                <div className="form-group">
                  <label className="mb-0">
                    <fbt desc="create.details.description">Description</fbt>
                  </label>
                  <div className="help-text">
                    <fbt desc="create.details.description.help">
                      Make sure to include any product variant details here.
                    </fbt>
                  </div>
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
                    value={
                      1
                    }
                    onChange={e => {
                      // const newWorkingHours = [
                      //   ...this.state.workingHours
                      // ]
                      // newWorkingHours[dayIndex] =
                      //   e.target.value +
                      //   '/' +
                      //   this.state.workingHours[dayIndex].split('/')[1]
                      // this.setState({ workingHours: newWorkingHours })
                    }}
                  >
                    {retailerSelect.map(([id, display]) => (
                      <option
                        key={id}
                        value={id}
                      >
                        {display}
                      </option>
                    ))}
                  </select>
                </div>

                <PricingChooser {...input('acceptedTokens', true)}>
                  <div className="form-group">
                    <label>
                      {!isMulti && <fbt desc="price-per-unit">Price</fbt>}
                      {isMulti && (
                        <fbt desc="price-per-unit">Price (per unit)</fbt>
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
          <div className="gray-box">
            <fbt desc="create.details.help">
              <h5>Add Listing Details</h5>
              Be sure to give your listing an appropriate title and description
              to let others know what you&apos;re offering. Adding some photos
              will increase the chances of selling your listing.
            </fbt>
          </div>
        </div>
      </div>
    )
  }

  validate() {
    const newState = {}

    if (!this.state.title) {
      newState.titleError = fbt(
        'Title is required',
        'create.error.Title is required'
      )
    } else if (this.state.title.length < 3) {
      newState.titleError = fbt(
        'Title is too short',
        'create.error.Title is too short'
      )
    } else if (this.state.title.length > 100) {
      // Limit from origin-validator/src/schemas/listing.json
      newState.titleError = fbt(
        'Title is too long',
        'create.error.Title is too long'
      )
    }

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
