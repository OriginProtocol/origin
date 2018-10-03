import React, { Component } from 'react'
import { Link, Prompt } from 'react-router-dom'
import { connect } from 'react-redux'
import { FormattedMessage, defineMessages, injectIntl } from 'react-intl'
import Form from 'react-jsonschema-form'

import { showAlert } from 'actions/Alert'
import {
  update as updateTransaction,
  upsert as upsertTransaction
} from 'actions/Transaction'
import { getOgnBalance } from 'actions/Wallet'

import BoostSlider from 'components/boost-slider'
import PhotoPicker from 'components/form-widgets/photo-picker'
import PriceField from 'components/form-widgets/price-field'
import Modal from 'components/modal'
import listingSchemaMetadata from 'utils/listingSchemaMetadata.js'
import WalletCard from 'components/wallet-card'
import { ProviderModal, ProcessingModal } from 'components/modals/wait-modals'

import { dappFormDataToOriginListing } from 'utils/listing'
import { getFiatPrice } from 'utils/priceUtils'
import { getBoostLevel, defaultBoostValue } from 'utils/boostUtils'
import {
  translateSchema,
  translateListingCategory
} from 'utils/translationUtils'

import origin from '../services/origin'

class ListingCreate extends Component {
  constructor(props) {
    super(props)

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

    this.schemaList = listingSchemaMetadata.listingTypes.map(listingType => {
      listingType.name = props.intl.formatMessage(listingType.translationName)
      return listingType
    })

    this.defaultState = {
      step: this.STEP.PICK_SCHEMA,
      selectedBoostAmount: props.wallet.ognBalance ? defaultBoostValue : 0,
      selectedSchemaType: null,
      translatedSchema: null,
      schemaExamples: null,
      schemaFetched: false,
      showNoSchemaSelectedError: false,
      formListing: {
        formData: {
          boostValue: defaultBoostValue,
          boostLevel: getBoostLevel(defaultBoostValue)
        }
      },
      showDetailsFormErrorMsg: false,
      showBoostTutorial: false
    }

    this.state = { ...this.defaultState }

    this.intlMessages = defineMessages({
      navigationWarning: {
        id: 'listing-create.navigationWarning',
        defaultMessage:
          'Are you sure you want to leave? If you leave this page your progress will be lost.'
      }
    })

    this.checkOgnBalance = this.checkOgnBalance.bind(this)
    this.handleSchemaSelection = this.handleSchemaSelection.bind(this)
    this.onDetailsEntered = this.onDetailsEntered.bind(this)
    this.onReview = this.onReview.bind(this)
    this.pollOgnBalance = this.pollOgnBalance.bind(this)
    this.resetForm = this.resetForm.bind(this)
    this.resetToPreview = this.resetToPreview.bind(this)
    this.setBoost = this.setBoost.bind(this)
  }

  componentDidUpdate(prevProps) {
    // conditionally show boost tutorial
    if (!this.state.showBoostTutorial) {
      this.detectNeedForBoostTutorial()
    }

    const { ognBalance } = this.props.wallet
    // apply OGN detection to slider
    if (ognBalance !== prevProps.wallet.ognBalance) {
      // only if prior to boost selection step
      this.state.step < this.STEP.BOOST &&
        this.setState({
          selectedBoostAmount: ognBalance ? defaultBoostValue : 0
        })
    }
  }

  componentWillUnmount() {
    clearInterval(this.ognBalancePoll)
  }

  detectNeedForBoostTutorial() {
    // show if 0 OGN and...
    !this.props.wallet.ognBalance &&
      // ...tutorial has not been expanded or skipped via "Review"
      // !JSON.parse(localStorage.getItem('boostTutorialViewed')) &&
      this.setState({
        showBoostTutorial: true
      })
  }

  pollOgnBalance() {
    this.ognBalancePoll = setInterval(() => {
      this.props.getOgnBalance()
    }, 10000)
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
          sellerSteps: {
            'ui:widget': 'hidden'
          },
          price: {
            'ui:field': PriceField
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

        const translatedSchema = translateSchema(schemaJson, selectedSchemaType)

        this.setState({
          selectedSchemaType,
          schemaFetched: true,
          showNoSchemaSelectedError: false,
          translatedSchema,
          schemaExamples:
            translatedSchema &&
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
      this.setState({
        showNoSchemaSelectedError: true
      })
    }
  }

  onDetailsEntered(formListing) {
    this.setState({
      formListing: {
        ...this.state.formListing,
        ...formListing,
        formData: {
          ...this.state.formListing.formData,
          ...formListing.formData
        }
      },
      step: this.STEP.BOOST,
      showDetailsFormErrorMsg: false
    })
    window.scrollTo(0, 0)
    this.checkOgnBalance()
  }

  checkOgnBalance() {
    if (
      this.props.wallet &&
      this.props.wallet.ognBalance &&
      parseFloat(this.props.wallet.ognBalance) > 0
    ) {
      this.setState({
        showBoostTutorial: false
      })
    }
  }

  setBoost(boostValue, boostLevel) {
    this.setState({
      formListing: {
        ...this.state.formListing,
        formData: {
          ...this.state.formListing.formData,
          boostValue,
          boostLevel
        }
      },
      selectedBoostAmount: boostValue
    })
  }

  onReview() {
    const { ognBalance } = this.props.wallet

    if (!localStorage.getItem('boostTutorialViewed')) {
      localStorage.setItem('boostTutorialViewed', true)
    }

    if (ognBalance < this.state.formListing.formData.boostValue) {
      this.setBoost(ognBalance, getBoostLevel(ognBalance))
    }

    this.setState({
      step: this.STEP.PREVIEW
    })

    window.scrollTo(0, 0)
  }

  async onSubmitListing(formListing) {
    try {
      this.setState({ step: this.STEP.METAMASK })
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
      this.props.getOgnBalance()
      this.setState({ step: this.STEP.SUCCESS })
    } catch (error) {
      console.error(error)
      this.setState({ step: this.STEP.ERROR })
    }
  }

  resetForm() {
    this.setState(this.defaultState)
  }

  resetToPreview(e) {
    e.preventDefault()

    this.setState({ step: this.STEP.PREVIEW })
  }

  render() {
    const { wallet, intl } = this.props
    const {
      formListing,
      selectedBoostAmount,
      selectedSchemaType,
      schemaExamples,
      showNoSchemaSelectedError,
      step,
      translatedSchema,
      showDetailsFormErrorMsg,
      showBoostTutorial
    } = this.state
    const { formData } = formListing
    const translatedCategory = translateListingCategory(formData.category)
    const usdListingPrice = getFiatPrice(formListing.formData.price, 'USD')

    return (
      <div className="listing-form">
        <div className="step-container">
          <div className="row">
            {step === this.STEP.PICK_SCHEMA && (
              <div className="col-md-6 col-lg-5 pick-schema">
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
                      className={`schema-selection${
                        selectedSchemaType === schema.type ? ' selected' : ''
                      }`}
                      key={schema.type}
                      onClick={() => this.handleSchemaSelection(schema.type)}
                      ga-category="create_listing"
                      ga-label={ `select_schema_${schema.type}`}
                    >
                      {schema.name}
                      <div
                        className={`schema-examples${
                          selectedSchemaType === schema.type ? ' selected' : ''
                        }`}
                      >
                        <p>
                          <FormattedMessage
                            id={'listing-create.listingsMayInclude'}
                            defaultMessage={
                              '{schemaName} listings may include:'
                            }
                            values={{ schemaName: schema.name }}
                          />
                        </p>
                        <ul>
                          {schemaExamples &&
                            schemaExamples.map(example => (
                              <li key={`${schema.name}-${example}`}>
                                {example}
                              </li>
                            ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                  {showNoSchemaSelectedError && (
                    <div className="info-box warn">
                      <p>
                        <FormattedMessage
                          id={'listing-create.noSchemaSelectedError'}
                          defaultMessage={
                            'You must first select a listing type'
                          }
                        />
                      </p>
                    </div>
                  )}
                </div>
                <div className="btn-container">
                  <button
                    className="float-right btn btn-primary btn-listing-create"
                    onClick={() => this.goToDetailsStep()}
                    ga-category="create_listing"
                    ga-label="select_schema_step_continue"
                  >
                    <FormattedMessage
                      id={'listing-create.next'}
                      defaultMessage={'Next'}
                    />
                  </button>
                </div>
              </div>
            )}
            {step === this.STEP.DETAILS && (
              <div className="col-md-6 col-lg-5 schema-details">
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
                    defaultMessage={'Create Your Listing'}
                  />
                </h2>
                <Form
                  schema={translatedSchema}
                  onSubmit={this.onDetailsEntered}
                  formData={formListing.formData}
                  onError={() =>
                    this.setState({ showDetailsFormErrorMsg: true })
                  }
                  uiSchema={this.uiSchema}
                >
                  {showDetailsFormErrorMsg && (
                    <div className="info-box warn">
                      <p>
                        <FormattedMessage
                          id={'listing-create.showDetailsFormErrorMsg'}
                          defaultMessage={
                            'Please fix errors before continuing.'
                          }
                        />
                      </p>
                    </div>
                  )}
                  <div className="btn-container">
                    <button
                      type="button"
                      className="btn btn-other btn-listing-create"
                      onClick={() =>
                        this.setState({ step: this.STEP.PICK_SCHEMA })
                      }
                      ga-category="create_listing"
                      ga-label="details_step_back"
                    >
                      <FormattedMessage
                        id={'backButtonLabel'}
                        defaultMessage={'Back'}
                      />
                    </button>
                    <button
                      type="submit"
                      className="float-right btn btn-primary btn-listing-create"
                      ga-category="create_listing"
                      ga-label="details_step_continue"
                    >
                      <FormattedMessage
                        id={'continueButtonLabel'}
                        defaultMessage={'Continue'}
                      />
                    </button>
                  </div>
                </Form>
              </div>
            )}
            {step === this.STEP.BOOST && (
              <div className="col-md-6 col-lg-5 select-boost">
                <label>
                  <FormattedMessage
                    id={'listing-create.stepNumberLabel'}
                    defaultMessage={'STEP {stepNumber}'}
                    values={{ stepNumber: Number(step) }}
                  />
                </label>
                <h2>
                  <FormattedMessage
                    id={'listing-create.boost-your-listing'}
                    defaultMessage={'Boost Your Listing'}
                  />
                </h2>
                <p className="help-block">
                  <FormattedMessage
                    id={'listing-create.form-help-boost'}
                    defaultMessage={
                      'You can boost your listing to get higher visibility in the Origin DApp. More buyers will see your listing, which increases the chances of a fast and successful sale.'
                    }
                  />
                </p>
                {showBoostTutorial && (
                  <div className="info-box">
                    <img src="images/ogn-icon-horiz.svg" role="presentation" />
                    <p className="text-bold">
                      <FormattedMessage
                        id={'listing-create.no-ogn'}
                        defaultMessage={'You have 0 {ogn} in your wallet.'}
                        values={{
                          ogn: (
                            <a
                              href="/#/about-tokens"
                              target="_blank"
                              rel="noopener noreferrer"
                              ga-category="create_listing"
                              ga-label="boost_listing_step_ogn"
                            >
                              OGN
                            </a>
                          )
                        }}
                      />
                    </p>
                    <p>
                      <FormattedMessage
                        id={'listing-create.post-acquisition'}
                        defaultMessage={
                          'Once you acquire some OGN you will be able to boost your listing.'
                        }
                      />
                    </p>
                    <div className="link-container">
                      <a
                        href="/#/about-tokens"
                        target="_blank"
                        rel="noopener noreferrer"
                        ga-category="create_listing"
                        ga-label="boost_listing_step_learn_more"
                      >
                        Learn More
                      </a>
                    </div>
                  </div>
                )}
                {!showBoostTutorial && (
                  <BoostSlider
                    onChange={this.setBoost}
                    ognBalance={wallet.ognBalance}
                    selectedBoostAmount={selectedBoostAmount}
                  />
                )}
                <div className="btn-container">
                  <button
                    type="button"
                    className="btn btn-other btn-listing-create"
                    onClick={() => this.setState({ step: this.STEP.DETAILS })}
                    ga-category="create_listing"
                    ga-label="boost_listing_step_back"
                  >
                    <FormattedMessage
                      id={'backButtonLabel'}
                      defaultMessage={'Back'}
                    />
                  </button>
                  <button
                    className="float-right btn btn-primary btn-listing-create"
                    onClick={this.onReview}
                    ga-category="create_listing"
                    ga-label="boost_listing_step_continue"
                  >
                    <FormattedMessage
                      id={'listing-create.review'}
                      defaultMessage={'Review'}
                    />
                  </button>
                </div>
              </div>
            )}
            {step >= this.STEP.PREVIEW && (
              <div className="col-md-7 col-lg-8 listing-preview">
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
                      <p className="label">
                        <FormattedMessage
                          id={'listing-create.title'}
                          defaultMessage={'Title'}
                        />
                      </p>
                    </div>
                    <div className="col-md-9">
                      <p>{formData.name}</p>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-3">
                      <p className="label">
                        <FormattedMessage
                          id={'listing-create.category'}
                          defaultMessage={'Category'}
                        />
                      </p>
                    </div>
                    <div className="col-md-9">
                      <p>{translatedCategory}</p>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-3">
                      <p className="label">
                        <FormattedMessage
                          id={'listing-create.description'}
                          defaultMessage={'Description'}
                        />
                      </p>
                    </div>
                    <div className="col-md-9">
                      <p className="ws-aware">{formData.description}</p>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-3">
                      <p className="label">Photos</p>
                    </div>
                    <div className="col-md-9 photo-row">
                      {formData.pictures &&
                        formData.pictures.map((dataUri, idx) => (
                          <div
                            key={idx}
                            className="photo"
                            role="presentation"
                            style={{ backgroundImage: `url("${dataUri}")` }}
                          />
                        ))}
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-3">
                      <p className="label">
                        <FormattedMessage
                          id={'listing-create.listing-price'}
                          defaultMessage={'Listing Price'}
                        />
                      </p>
                    </div>
                    <div className="col-md-9">
                      <p>
                        <img
                          className="eth-icon"
                          src="images/eth-icon.svg"
                          role="presentation"
                        />
                        <span className="text-bold">
                          {Number(formData.price).toLocaleString(undefined, {
                            minimumFractionDigits: 5,
                            maximumFractionDigits: 5
                          })}
                        </span>&nbsp;
                        <a
                          className="eth-abbrev"
                          href="#"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          ETH
                        </a>
                        <span className="help-block">
                          &nbsp;| {usdListingPrice} USD&nbsp;
                          <span className="text-uppercase">
                            {'('}
                            <FormattedMessage
                              id={'listing-create.appropriate-value'}
                              defaultMessage={'Approximate Value'}
                            />
                            {')'}
                          </span>
                        </span>
                      </p>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-3">
                      <p className="label">
                        <FormattedMessage
                          id={'listing-create.boost-level'}
                          defaultMessage={'Boost Level'}
                        />
                      </p>
                    </div>
                    <div className="col-md-9">
                      <p>
                        <img
                          className="ogn-icon"
                          src="images/ogn-icon.svg"
                          role="presentation"
                        />
                        <span className="text-bold">{formData.boostValue}</span>&nbsp;
                        <a
                          className="ogn-abbrev"
                          href="/#/about-tokens"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          OGN
                        </a>
                        <span className="help-block">
                          &nbsp;| {formData.boostLevel.toUpperCase()}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
                {/* Revisit this later
                  <a
                    className="bottom-cta"
                    href="#"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Preview in browser
                  </a>
                */}
                <div className="btn-container">
                  <button
                    className="btn btn-other float-left btn-listing-create"
                    onClick={() => this.setState({ step: this.STEP.BOOST })}
                    ga-category="create_listing"
                    ga-label="review_step_back"
                  >
                    <FormattedMessage
                      id={'listing-create.backButtonLabel'}
                      defaultMessage={'Back'}
                    />
                  </button>
                  <button
                    className="btn btn-primary float-right btn-listing-create"
                    onClick={() => this.onSubmitListing(formListing)}
                    ga-category="create_listing"
                    ga-label="review_step_done"
                  >
                    <FormattedMessage
                      id={'listing-create.doneButtonLabel'}
                      defaultMessage={'Done'}
                    />
                  </button>
                </div>
              </div>
            )}
            <div
              className={`pt-xs-4 pt-sm-4 col-md-5 col-lg-4${
                step >= this.STEP.PREVIEW ? '' : ' offset-md-1 offset-lg-3'
              }`}
            >
              <WalletCard
                wallet={wallet}
                withBalanceTooltip={!this.props.wallet.ognBalance}
                withMenus={true}
                withProfile={false}
              />
              {step === this.STEP.PICK_SCHEMA && (
                <div className="info-box">
                  <h2>
                    <FormattedMessage
                      id={'listing-create.create-a-listing'}
                      defaultMessage={'Create A Listing On The Origin DApp'}
                    />
                  </h2>
                  <p>
                    <FormattedMessage
                      id={'listing-create.form-help-schema'}
                      defaultMessage={`Get started by selecting the type of listing you want to create. You will then be able to set a price and listing details.`}
                    />
                  </p>
                </div>
              )}
              {step === this.STEP.DETAILS && (
                <div className="info-box">
                  <h2>
                    <FormattedMessage
                      id={'listing-create.add-details'}
                      defaultMessage={'Add Listing Details'}
                    />
                  </h2>
                  <p>
                    <FormattedMessage
                      id={'listing-create.form-help-details'}
                      defaultMessage={`Be sure to give your listing an appropriate title and description to let others know what you're offering. Adding some photos of your listing will help potential buyers decide if the want to buy your listing.`}
                    />
                  </p>
                </div>
              )}
              {step === this.STEP.BOOST && (
                <div className="info-box">
                  <h2>
                    <FormattedMessage
                      id={'listing-create.about-visibility'}
                      defaultMessage={'About Visibility'}
                    />
                  </h2>
                  <p>
                    <FormattedMessage
                      id={'listing-create.form-help-visibility'}
                      defaultMessage={`Origin sorts and displays listings based on relevance, recency, and boost level. Higher-visibility listings are shown to buyers more often.`}
                    />
                  </p>
                  <h2>
                    <FormattedMessage
                      id={'listing-create.origin-tokens'}
                      defaultMessage={'Origin Tokens'}
                    />
                  </h2>
                  <p>
                    <FormattedMessage
                      id={'listing-create.form-help-ogn'}
                      defaultMessage={`OGN is an ERC-20 token used for incentives and governance on the Origin platform. Future intended uses of OGN might include referral rewards, reputation incentives, spam prevention, developer rewards, and platform governance.`}
                    />
                  </p>
                  <div className="link-container">
                    <a
                      href="/#/about-tokens"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <FormattedMessage
                        id={'listing-create.learn-more'}
                        defaultMessage={'Learn More'}
                      />
                    </a>
                  </div>
                </div>
              )}
              {step >= this.STEP.PREVIEW && (
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
                        'When you submit this listing, you will be asked to confirm your transaction in MetaMask. Buyers will then be able to see your listing and make offers on it.'
                      }
                    />
                    {selectedBoostAmount && (
                      <div className="boost-reminder">
                        <FormattedMessage
                          id={'listing-create.whatHappensNextContent2'}
                          defaultMessage={
                            '{selectedBoostAmount} OGN will be transferred for boosting. If you close your listing before accepting an offer, the OGN will be refunded to you.'
                          }
                          values={{
                            selectedBoostAmount
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            {step === this.STEP.METAMASK && <ProviderModal />}
            {step === this.STEP.PROCESSING && <ProcessingModal />}
            {step === this.STEP.SUCCESS && (
              <Modal backdrop="static" isOpen={true}>
                <div className="image-container">
                  <img
                    src="images/circular-check-button.svg"
                    role="presentation"
                  />
                </div>
                <h3>
                  <FormattedMessage
                    id={'listing-create.successMessage'}
                    defaultMessage={'Your listing has been created!'}
                  />
                </h3>
                <div className="disclaimer">
                  <p>
                    <FormattedMessage
                      id={'listing-create.successDisclaimer'}
                      defaultMessage={
                        "Your listing will be visible within a few seconds. Here's what happens next:"
                      }
                    />
                  </p>
                  <ul>
                    <li>
                      <FormattedMessage
                        id={'listing-create.success-1'}
                        defaultMessage={
                          'Buyers will now see your listing on the marketplace.'
                        }
                      />
                    </li>
                    <li>
                      <FormattedMessage
                        id={'listing-create.success-2'}
                        defaultMessage={
                          'When a buyer makes an offer on your listing, you can choose to accept or reject it.'
                        }
                      />
                    </li>
                    <li>
                      <FormattedMessage
                        id={'listing-create.success-3'}
                        defaultMessage={
                          'Once the offer is accepted, you will be expected to fulfill the order.'
                        }
                      />
                    </li>
                    <li>
                      <FormattedMessage
                        id={'listing-create.success-4'}
                        defaultMessage={
                          'You will receive payment once the buyer confirms that the order has been fulfilled.'
                        }
                      />
                    </li>
                  </ul>
                </div>
                <div className="button-container">
                  <button
                    className="btn btn-clear"
                    onClick={this.resetForm}
                    ga-category="create_listing"
                    ga-label="create_another_listing"
                  >
                    <FormattedMessage
                      id={'listing-create.createAnother'}
                      defaultMessage={'Create Another Listing'}
                    />
                  </button>
                  <Link
                    to="/"
                    className="btn btn-clear"
                    ga-category="create_listing"
                    ga-label="see_all_listings"
                  >
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
                    ga-category="create_listing"
                    ga-label="error_dismiss"
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
        <Prompt
          when={step !== this.STEP.PICK_SCHEMA && step !== this.STEP.SUCCESS}
          message={intl.formatMessage(this.intlMessages.navigationWarning)}
        />
      </div>
    )
  }
}

const mapStateToProps = state => {
  return {
    wallet: state.wallet,
    exchangeRates: state.exchangeRates
  }
}

const mapDispatchToProps = dispatch => ({
  showAlert: msg => dispatch(showAlert(msg)),
  updateTransaction: (hash, confirmationCount) =>
    dispatch(updateTransaction(hash, confirmationCount)),
  upsertTransaction: transaction => dispatch(upsertTransaction(transaction)),
  getOgnBalance: () => dispatch(getOgnBalance())
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(ListingCreate))
