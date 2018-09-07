import React, { Component, Fragment } from 'react'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'
import { FormattedMessage, defineMessages, injectIntl } from 'react-intl'
import Form from 'react-jsonschema-form'

import { showAlert } from 'actions/Alert'
import {
  update as updateTransaction,
  upsert as upsertTransaction
} from '../actions/Transaction'

import BoostSlider from 'components/boost-slider'
import PhotoPicker from 'components/form-widgets/photo-picker'
import PriceField from 'components/form-widgets/price-field'
import Modal from 'components/modal'
import WalletCard from 'components/wallet-card'

import { dappFormDataToOriginListing } from 'utils/listing'
import getCurrentProvider from 'utils/getCurrentProvider'
import { getFiatPrice } from 'utils/priceUtils'
import { getBoostLevel, defaultBoostValue } from 'utils/boostUtils'
import { translateSchema, translateListingCategory } from 'utils/translationUtils'

import origin from '../services/origin'

class ListingCreate extends Component {
  constructor(props) {
    super(props)

    // This is non-ideal fix until IPFS can correctly return 443 errors
    // Server limit is 2MB, with 100K safety buffer
    this.MAX_UPLOAD_BYTES = 2e6 - 1e5

    // Enum of our states
    this.STEP = {
      PICK_SCHEMA: 1,
      DETAILS: 2,
      BOOST: 3,
      PREVIEW: 4,
      METAMASK: 5,
      PROCESSING: 6,
      SUCCESS: 7,
      ERROR: 8
    }

    const schemaTypeLabels = defineMessages({
      forSale: {
        id: 'listing-create.forSaleLabel',
        defaultMessage: 'For Sale'
      },
      housing: {
        id: 'listing-create.housingLabel',
        defaultMessage: 'Housing'
      },
      transportation: {
        id: 'listing-create.transportation',
        defaultMessage: 'Transportation'
      },
      tickets: {
        id: 'listing-create.tickets',
        defaultMessage: 'Tickets'
      },
      services: {
        id: 'listing-create.services',
        defaultMessage: 'Services'
      },
      announcements: {
        id: 'listing-create.announcements',
        defaultMessage: 'Announcements'
      }
    })

    this.schemaList = [
      {
        type: 'for-sale',
        name: props.intl.formatMessage(schemaTypeLabels.forSale),
        img: 'for-sale.jpg'
      },
      {
        type: 'housing',
        name: props.intl.formatMessage(schemaTypeLabels.housing),
        img: 'housing.jpg'
      },
      {
        type: 'transportation',
        name: props.intl.formatMessage(schemaTypeLabels.transportation),
        img: 'transportation.jpg'
      },
      {
        type: 'tickets',
        name: props.intl.formatMessage(schemaTypeLabels.tickets),
        img: 'tickets.jpg'
      },
      {
        type: 'services',
        name: props.intl.formatMessage(schemaTypeLabels.services),
        img: 'services.jpg'
      },
      {
        type: 'announcements',
        name: props.intl.formatMessage(schemaTypeLabels.announcements),
        img: 'announcements.jpg'
      }
    ]

    this.state = {
      // TODO:John - wire up ognBalance and isFirstListing when ready
      ognBalance: 0,
      isFirstListing: false,
      step: this.STEP.PICK_SCHEMA,
      selectedSchemaType: null,
      selectedSchema: null,
      translatedSchema: null,
      schemaExamples: null,
      schemaFetched: false,
      formListing: {
        formData: {
          boostValue: defaultBoostValue,
          boostLevel: getBoostLevel(defaultBoostValue)
        }
      },
      currentProvider: getCurrentProvider(
        origin && origin.contractService && origin.contractService.web3
      ),
      isBoostExpanded: false,
      usdListingPrice: 0
    }

    this.handleSchemaSelection = this.handleSchemaSelection.bind(this)
    this.onDetailsEntered = this.onDetailsEntered.bind(this)
    this.onBoostSelected = this.onBoostSelected.bind(this)
    this.toggleBoostBox = this.toggleBoostBox.bind(this)
    this.updateUsdPrice = this.updateUsdPrice.bind(this)
    this.onBoostSliderChange = this.onBoostSliderChange.bind(this)
  }

  async updateUsdPrice() {
    const usdListingPrice = await getFiatPrice(this.state.formListing.formData.price, 'USD')
    this.setState({
      usdListingPrice
    })
  }

  handleSchemaSelection(selectedSchemaType) {
    fetch(`schemas/${selectedSchemaType}.json`)
      .then(response => response.json())
      .then(schemaJson => {
        PriceField.defaultProps = {
          options: {
            selectedSchema: schemaJson
          }
        }
        this.uiSchema = {
          examples: {
            'ui:widget': 'hidden'
          },
          price: {
            'ui:field': PriceField,
          },
          description: {
            'ui:widget': 'textarea',
            'ui:options': {
              rows: 4
            }
          },
          pictures: {
            'ui:widget': PhotoPicker
          }
        }

        const translatedSchema = translateSchema(
          schemaJson,
          selectedSchemaType
        )

        this.setState({
          selectedSchemaType,
          selectedSchema: schemaJson,
          schemaFetched: true,
          translatedSchema,
          schemaExamples: translatedSchema &&
                          translatedSchema.properties &&
                          translatedSchema.properties.examples &&
                          translatedSchema.properties.examples.enumNames
        })
      })
  }

  goToDetailsStep() {
    if (this.state.schemaFetched) {
      this.setState({
        step: this.STEP.DETAILS
      })
      window.scrollTo(0, 0)
    } else {
      console.error('Error fetching schema JSON')
    }
  }

  onDetailsEntered(formListing) {
    // Helper function to approximate size of object in bytes
    function roughSizeOfObject(object) {
      const objectList = []
      const stack = [object]
      let bytes = 0
      while (stack.length) {
        const value = stack.pop()
        if (typeof value === 'boolean') {
          bytes += 4
        } else if (typeof value === 'string') {
          bytes += value.length * 2
        } else if (typeof value === 'number') {
          bytes += 8
        } else if (
          typeof value === 'object' &&
          objectList.indexOf(value) === -1
        ) {
          objectList.push(value)
          for (const i in value) {
            if (value.hasOwnProperty(i)) {
              stack.push(value[i])
            }
          }
        }
      }
      return bytes
    }
    if (roughSizeOfObject(formListing.formData) > this.MAX_UPLOAD_BYTES) {
      this.props.showAlert(
        'Your listing is too large. Consider using fewer or smaller photos.'
      )
    } else {
      this.setState({
        formListing: {
          ...this.state.formListing,
          ...formListing,
          formData: {
            ...this.state.formListing.formData,
            ...formListing.formData
          }
        },
        step: this.STEP.BOOST
      })
      window.scrollTo(0, 0)
    }
  }

  onBoostSelected(amount) {
    console.log(amount)
    this.setState({
      step: this.STEP.PREVIEW
    })
    window.scrollTo(0, 0)
    this.updateUsdPrice()
  }

  onBoostSliderChange(boostValue, boostLevel) {
    this.setState({
      formListing: {
        ...this.state.formListing,
        formData: {
          ...this.state.formListing.formData,
          boostValue,
          boostLevel
        }
      }
    })
  }

  async onSubmitListing(formListing, selectedSchemaType) {
    try {
      this.setState({ step: this.STEP.METAMASK })
      console.log(formListing)
      this.setState({ step: this.STEP.PROCESSING })
      console.log(formListing.formData, selectedSchemaType)
      const listing = dappFormDataToOriginListing(formListing.formData)
      const transactionReceipt = await origin.marketplace.createListing(
        listing,
        (confirmationCount, transactionReceipt) => {
          this.props.updateTransaction(confirmationCount, transactionReceipt)
        }
      )
      this.props.upsertTransaction({
        ...transactionReceipt,
        transactionTypeKey: 'createListing'
      })
      this.setState({ step: this.STEP.SUCCESS })
    } catch (error) {
      console.error(error)
      this.setState({ step: this.STEP.ERROR })
    }
  }

  resetToPreview(e) {
    e.preventDefault()

    this.setState({ step: this.STEP.PREVIEW })
  }

  toggleBoostBox() {
    this.setState({
      isBoostExpanded: !this.state.isBoostExpanded
    })
  }

  render() {
    const { wallet } = this.props
    const { currentProvider, formListing, isBoostExpanded, isFirstListing, ognBalance, selectedSchema, selectedSchemaType, schemaExamples, step, translatedSchema, usdListingPrice } = this.state
    const { formData } = formListing
    const translatedFormData = (formData && formData.category && translateListingCategory(formData)) || {}

    return (
      <div className="container listing-form">
        <div className="step-container">
          <div className="row">
            {step === this.STEP.PICK_SCHEMA &&
              <div className="col-md-5 pick-schema">
                <label>
                  <FormattedMessage
                    id={'listing-create.stepNumberLabel'}
                    defaultMessage={'STEP {stepNumber}'}
                    values={{ stepNumber: Number(step) }}
                  />
                </label>
                <h2>
                  <FormattedMessage
                    id={'listing-create.whatTypeOfListing'}
                    defaultMessage={
                      'What type of listing do you want to create?'
                    }
                  />
                </h2>
                <div className="schema-options">
                  {this.schemaList.map(schema => (
                    <div
                      className={ `schema-selection ${selectedSchemaType === schema.type ? ' selected' : ''}`}
                      key={schema.type}
                      onClick={() => this.handleSchemaSelection(schema.type)}
                    >
                      {schema.name}
                      <div className={ `schema-examples ${selectedSchemaType === schema.type ? ' selected' : ''}` }>
                        <p>{ schema.name } listings may include:</p>
                        <ul>
                          {schemaExamples && schemaExamples.map((example) =>
                            <li key={ `${schema.name}-${example}` }>{ example }</li>
                          )}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="btn-container">
                  <button
                    className="float-right btn btn-primary"
                    onClick={() => this.goToDetailsStep()}
                  >
                    <FormattedMessage
                      id={'listing-create.next'}
                      defaultMessage={'Next'}
                    />
                  </button>
                </div>
              </div>
            }
            {step === this.STEP.DETAILS &&
              <div className="col-md-5 schema-details">
                <label>
                  <FormattedMessage
                    id={'listing-create.stepNumberLabel'}
                    defaultMessage={'STEP {stepNumber}'}
                    values={{ stepNumber: Number(step) }}
                  />
                </label>
                <h2>
                  <FormattedMessage
                    id={'listing-create.createListingHeading'}
                    defaultMessage={'Create your listing'}
                  />
                </h2>
                <Form
                  schema={translatedSchema}
                  onSubmit={this.onDetailsEntered}
                  formData={formListing.formData}
                  onError={errors =>
                    console.log(
                      `react-jsonschema-form errors: ${errors.length}`
                    )
                  }
                  uiSchema={ this.uiSchema }
                >
                  <div className="btn-container">
                    <button
                      type="button"
                      className="btn btn-other"
                      onClick={() =>
                        this.setState({ step: this.STEP.PICK_SCHEMA })
                      }
                    >
                      <FormattedMessage
                        id={'backButtonLabel'}
                        defaultMessage={'Back'}
                      />
                    </button>
                    <button
                      type="submit"
                      className="float-right btn btn-primary"
                    >
                      <FormattedMessage
                        id={'continueButtonLabel'}
                        defaultMessage={'Continue'}
                      />
                    </button>
                  </div>
                </Form>
              </div>
            }
            {step === this.STEP.BOOST &&
              <div className="col-md-5 select-boost">
                <label>
                  <FormattedMessage
                    id={'listing-create.stepNumberLabel'}
                    defaultMessage={'STEP {stepNumber}'}
                    values={{ stepNumber: Number(step) }}
                  />
                </label>
                <h2>Boost your listing</h2>
                {isFirstListing &&
                  <div className="info-box">
                    <img src="images/ogn-icon-horiz.svg" role="presentation" />
                    <p className="text-bold">You have 0 <a href="#" arget="_blank" rel="noopener noreferrer">OGN</a> in your wallet.</p>
                    <p>Once you acquire some OGN you will be able to boost your listing.</p>
                    <p className="expand-btn" onClick={ this.toggleBoostBox }>
                      What is a boost? <span className={ isBoostExpanded ? 'rotate-up' : '' }>&#x25be;</span>
                    </p>
                    {isBoostExpanded &&
                      <div className="info-box-bottom">
                        <hr />
                        <img src="images/boost-icon.svg" role="presentation" />
                        <p className="text-bold">Boosting a listing on the Origin DApp</p>
                        <p>
                          Selling on the Origin DApp requires you, as the seller, to give a guarantee to the buyer in case there’s a problem with the product or service you’re offering. This is accomplished by giving your listing a “boost”.
                        </p>
                        <p>
                          In addition to this, “boosting” your listing will allow it to have more visibility and appear higher in the list of available listings.
                        </p>
                        <p>
                          Boosting on the Origin DApp is done using <a href="#" arget="_blank" rel="noopener noreferrer">Origin Tokens (OGN).</a>
                        </p>
                      </div>
                    }
                  </div>
                }
                {!isFirstListing &&
                  <BoostSlider
                    onChange={ this.onBoostSliderChange }
                    ognBalance={ ognBalance }
                    defaultValue={ (formData && formData.boostValue) || defaultBoostValue } 
                  />
                }
                <div className="btn-container">
                  <button
                    type="button"
                    className="btn btn-other"
                    onClick={() =>
                      this.setState({ step: this.STEP.DETAILS })
                    }
                  >
                    <FormattedMessage
                      id={'backButtonLabel'}
                      defaultMessage={'Back'}
                    />
                  </button>
                  <button
                    className="float-right btn btn-primary"
                    onClick={() => this.onBoostSelected()}
                  >
                    Review
                  </button>
                </div>
              </div>
            }
            {step >= this.STEP.PREVIEW && (
              <div className="col-md-8 listing-preview">
                <label className="create-step">
                  <FormattedMessage
                    id={'listing-create.stepNumberLabel'}
                    defaultMessage={'STEP {stepNumber}'}
                    values={{ stepNumber: Number(step) }}
                  />
                </label>
                <h2>
                  <FormattedMessage
                    id={'listing-create.reviewListingHeading'}
                    defaultMessage={'Review your listing'}
                  />
                </h2>
                <div className="preview">
                  <div className="row">
                    <div className="col-md-3">
                      <p className="label">Title</p>
                    </div>
                    <div className="col-md-9">
                      <p>{ translatedFormData.name }</p>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-3">
                      <p className="label">Category</p>
                    </div>
                    <div className="col-md-9">
                      <p>{ translatedFormData.category }</p>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-3">
                      <p className="label">Description</p>
                    </div>
                    <div className="col-md-9">
                      <p>{ translatedFormData.description }</p>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-3">
                      <p className="label">Location</p>
                    </div>
                    <div className="col-md-9">
                      <p>{ translatedFormData.location }</p>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-3">
                      <p className="label">Photos</p>
                    </div>
                    <div className="col-md-9 photo-row">
                      {
                        translatedFormData.pictures &&
                        translatedFormData.pictures.map((dataUri, idx) => 
                          <img src={ dataUri } role="presentation" key={ idx } />
                        )
                      }
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-3">
                      <p className="label">Listing Price</p>
                    </div>
                    <div className="col-md-9">
                      <p>
                        <img className="eth-icon" src="images/eth-icon.svg" role="presentation" />
                        <span className="text-bold">{ translatedFormData.price }</span>&nbsp;
                        <a className="eth-abbrev" href="#" target="_blank" rel="noopener noreferrer">ETH</a>
                        <span className="help-block">
                          &nbsp;| { usdListingPrice } USD&nbsp;
                          <span className="text-uppercase">(Approximate Value)</span>
                        </span>
                      </p>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-3">
                      <p className="label">Boost Level</p>
                    </div>
                    <div className="col-md-9">
                      <p className="boost-level">{ translatedFormData.boostLevel }</p>
                      <p>
                        <img className="ogn-icon" src="images/ogn-icon.svg" role="presentation" />
                        <span className="text-bold">{ translatedFormData.boostValue }</span>&nbsp;
                        <a className="ogn-abbrev" href="#" target="_blank" rel="noopener noreferrer">OGN</a>
                        <span className="help-block">
                          &nbsp;| x.xx USD&nbsp;
                          <span className="text-uppercase">(Approximate Value)</span>
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
                <a className="bottom-cta" href="#" target="_blank" rel="noopener noreferrer">Preview in browser</a>
                <div className="btn-container">
                  <button
                    className="btn btn-other float-left"
                    onClick={() => this.setState({ step: this.STEP.BOOST })}
                  >
                    <FormattedMessage
                      id={'listing-create.backButtonLabel'}
                      defaultMessage={'Back'}
                    />
                  </button>
                  <button
                    className="btn btn-primary float-right"
                    onClick={() =>
                      this.onSubmitListing(
                        formListing,
                        selectedSchemaType
                      )
                    }
                  >
                    <FormattedMessage
                      id={'listing-create.doneButtonLabel'}
                      defaultMessage={'Done'}
                    />
                  </button>
                </div>
              </div>
            )}
            <div className={ `col-md-4${step === this.STEP.PREVIEW ? '' : ' offset-md-3'}` }>
              <WalletCard
                wallet={wallet}
                withMenus={true}
                withProfile={false}
              />
              {step === this.STEP.PICK_SCHEMA &&
                <Fragment>
                  <div className="info-box">
                    <h2>Creating a listing on the Origin Protocol DApp</h2>
                    <p>Lorem ipsum dolor sit amet consectetuer adsplicing nonummy pellentesque curabitur lorem ipsum dolor sit amet.</p>
                  </div>
                  <div className="about-ogn info-box">
                    <div className="image-container text-center">
                      <img src="images/ogn-icon-horiz.svg" role="presentation" />
                    </div>
                    <h2>About Origin Tokens</h2>
                    <p>Lorem ipsum dolor sit amet consectetuer adsplicing nonummy pellentesque curabitur.</p>
                    <div className="link-container">
                      <a href="/#/about-tokens" target="_blank" rel="noopener noreferrer">Learn more</a>
                    </div>
                  </div>
                  <div className="info-box">
                    <h2>
                      <FormattedMessage
                        id={'listing-create.chooseSchema'}
                        defaultMessage={
                          'Choose a schema for your product or service'
                        }
                      />
                    </h2>
                    <p>
                      <FormattedMessage
                        id={'listing-create.schemaExplainer'}
                        defaultMessage={
                          'Your product or service will use a schema to describe its attributes like name, description, and price. Origin already has multiple schemas that map to well-known categories of listings like housing, auto, and services.'
                        }
                      />
                    </p>
                    <div className="info-box-image">
                      <img
                        className="d-none d-md-block"
                        src="images/features-graphic.svg"
                        role="presentation"
                      />
                    </div>
                  </div>
                </Fragment>
              }
              {step === this.STEP.DETAILS &&
                <Fragment>
                  <div className="info-box">
                    <p>
                      Be sure to give your listing an appropriate title and description that will inform others as to what you’re offering.<br />
                      If you’re listing is only offered in a specific geographic location, please be sure to indicate that.<br />
                      Finally, adding some photos of your listing will go a long way to helping potential buyers decide if they want to make the purchase.
                    </p>
                  </div>
                  <div className="info-box">
                    <div>
                      <h2>
                        <FormattedMessage
                          id={'listing-create.howItWorksHeading'}
                          defaultMessage={'How it works'}
                        />
                      </h2>
                      <FormattedMessage
                        id={'listing-create.howItWorksContentPart1'}
                        defaultMessage={
                          'Origin uses a Mozilla project called {jsonSchemaLink}  to validate your listing according to standard rules. This standardization is key to allowing unaffiliated entities to read and write to the same data layer.'
                        }
                        values={{
                          jsonSchemaLink: (
                            <FormattedMessage
                              id={'listing-create.jsonSchema'}
                              defaultMessage={'JSONSchema'}
                            />
                          )
                        }}
                      />
                      <br />
                      <br />
                      <FormattedMessage
                        id={'listing-create.howItWorksContentPart2'}
                        defaultMessage={
                          'Be sure to give your listing an appropriate title and description that will inform others as to what you’re offering.'
                        }
                        values={{
                          jsonSchemaLink: (
                            <FormattedMessage
                              id={'listing-create.jsonSchema'}
                              defaultMessage={'JSONSchema'}
                            />
                          )
                        }}
                      />
                      <a
                        href={`schemas/${selectedSchemaType}.json`}
                        target="_blank"
                      >
                        <FormattedMessage
                          id={'listing-create.viewSchemaLinkLabel'}
                          defaultMessage={'View the {schemaName} schema'}
                          values={{
                            schemaName: (
                              <code>{selectedSchema.name}</code>
                            )
                          }}
                        />
                      </a>
                    </div>
                    <div className="info-box-image">
                      <img
                        className="d-none d-md-block"
                        src="images/features-graphic.svg"
                        role="presentation"
                      />
                    </div>
                  </div>
                </Fragment>
              }
              {step === this.STEP.BOOST &&
                <div className="info-box">
                  <h2>About Visibility</h2>
                  <p>Lorem ipsum dolor sit amet consectetuer adsplicing nonummy pellentesque curabitur.</p>
                </div>
              }
              {step >= this.STEP.PREVIEW &&
                <div className="info-box">
                  <div>
                    <h2>
                      <FormattedMessage
                        id={'listing-create.whatHappensNextHeading'}
                        defaultMessage={'What happens next?'}
                      />
                    </h2>
                    <FormattedMessage
                      id={'listing-create.whatHappensNextContent1'}
                      defaultMessage={
                        'When you hit submit, a JSON object representing your listing will be published to {ipfsLink}  and the content hash will be published to a listing smart contract running on the Ethereum network.'
                      }
                      values={{
                        ipfsLink: (
                          <a
                            target="_blank"
                            rel="noopener noreferrer"
                            href="https://ipfs.io"
                          >
                            <FormattedMessage
                              id={'listing-create.IPFS'}
                              defaultMessage={'IPFS'}
                            />
                          </a>
                        )
                      }}
                    />
                    <br />
                    <br />
                    <FormattedMessage
                      id={'listing-create.whatHappensNextContent2'}
                      defaultMessage={
                        'Please review your listing before submitting. Your listing will appear to others just as it looks on the window to the left.'
                      }
                    />
                  </div>
                </div>
              }
            </div>
            {step === this.STEP.METAMASK && (
              <Modal backdrop="static" isOpen={true}>
                <div className="image-container">
                  <img src="images/spinner-animation.svg" role="presentation" />
                </div>
                <FormattedMessage
                  id={'listing-create.confirmTransaction'}
                  defaultMessage={'Confirm transaction'}
                />
                <br />
                <FormattedMessage
                  id={'listing-create.pressSubmitInMetaMask'}
                  defaultMessage={'Press {submit} in {currentProvider} window'}
                  values={{
                    currentProvider,
                    submit: <span>&ldquo;Submit&rdquo;</span>
                  }}
                />
              </Modal>
            )}
            {step === this.STEP.PROCESSING && (
              <Modal backdrop="static" isOpen={true}>
                <div className="image-container">
                  <img src="images/spinner-animation.svg" role="presentation" />
                </div>
                <FormattedMessage
                  id={'listing-create.uploadingYourListing'}
                  defaultMessage={'Uploading your listing'}
                />
                <br />
                <FormattedMessage
                  id={'listing-create.pleaseStandBy'}
                  defaultMessage={'Please stand by...'}
                />
              </Modal>
            )}
            {step === this.STEP.SUCCESS && (
              <Modal backdrop="static" isOpen={true}>
                <div className="image-container">
                  <img
                    src="images/circular-check-button.svg"
                    role="presentation"
                  />
                </div>
                <FormattedMessage
                  id={'listing-create.successMessage'}
                  defaultMessage={'Success!'}
                />
                <div className="disclaimer">
                  <FormattedMessage
                    id={'listing-create.successDisclaimer'}
                    defaultMessage={
                      'Your listing will be visible within a few seconds.'
                    }
                  />
                </div>
                <div className="button-container">
                  <Link to="/" className="btn btn-clear">
                    <FormattedMessage
                      id={'listing-create.seeAllListings'}
                      defaultMessage={'See All Listings'}
                    />
                  </Link>
                </div>
              </Modal>
            )}
            {step === this.STEP.ERROR && (
              <Modal backdrop="static" isOpen={true}>
                <div className="image-container">
                  <img src="images/flat_cross_icon.svg" role="presentation" />
                </div>
                <FormattedMessage
                  id={'listing-create.error1'}
                  defaultMessage={'There was a problem creating this listing.'}
                />
                <br />
                <FormattedMessage
                  id={'listing-create.error2'}
                  defaultMessage={'See the console for more details.'}
                />
                <div className="button-container">
                  <a
                    className="btn btn-clear"
                    onClick={this.resetToPreview}
                  >
                    <FormattedMessage
                      id={'listing-create.OK'}
                      defaultMessage={'OK'}
                    />
                  </a>
                </div>
              </Modal>
            )}
          </div>
        </div>
      </div>
    )
  }
}

const mapStateToProps = state => {
  return {
    wallet: state.wallet
  }
}

const mapDispatchToProps = dispatch => ({
  showAlert: msg => dispatch(showAlert(msg)),
  updateTransaction: (hash, confirmationCount) =>
    dispatch(updateTransaction(hash, confirmationCount)),
  upsertTransaction: transaction => dispatch(upsertTransaction(transaction))
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(ListingCreate))
