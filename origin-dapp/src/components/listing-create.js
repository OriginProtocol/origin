import { showAlert } from 'actions/Alert'
import React, { Component, Fragment } from 'react'
import { withRouter } from 'react-router'
import { Link, Prompt } from 'react-router-dom'
import { connect } from 'react-redux'
import { FormattedMessage, defineMessages, injectIntl } from 'react-intl'
import Form from 'react-jsonschema-form'
import queryString from 'query-string'


import { originToDAppListing } from 'utils/listing'

import { handleNotificationsSubscription } from 'actions/Activation'
import { storeWeb3Intent } from 'actions/App'
import {
  update as updateTransaction,
  upsert as upsertTransaction
} from 'actions/Transaction'
import { getOgnBalance } from 'actions/Wallet'

import BoostSlider from 'components/boost-slider'
import StepsProgress from 'components/steps-progress'
import PhotoPicker from 'components/form-widgets/photo-picker'
import PriceField from 'components/form-widgets/price-field'
import BoostLimitField from 'components/form-widgets/boost-limit-field'
import QuantityField from 'components/form-widgets/quantity-field'
import Modal from 'components/modal'
import Calendar from './calendar'

import { getListing } from 'utils/listing'
import { generateDefaultPricing } from 'utils/calendarHelpers'
import listingSchemaMetadata from 'utils/listingSchemaMetadata'
import WalletCard from 'components/wallet-card'
import { ProviderModal, ProcessingModal } from 'components/modals/wait-modals'

import { getBoostLevel, defaultBoostValue } from 'utils/boostUtils'
import { dappFormDataToOriginListing } from 'utils/listing'
import { getFiatPrice } from 'utils/priceUtils'
import { formattedAddress } from 'utils/user'
import { getDataURIsFromImgURLs, picURIsOnly } from 'utils/fileUtils'

import {
  translateSchema,
  translateListingCategory
} from 'utils/translationUtils'

import origin from '../services/origin'

const { web3 } = origin.contractService

class ListingCreate extends Component {
  constructor(props) {
    super(props)

    this.STEP = {
      PICK_CATEGORY: 1,
      PICK_SUBCATEGORY: 2, // NOTE: this is a mobile-only step
      DETAILS: 3,
      AVAILABILITY: 4,
      BOOST: 5,
      PREVIEW: 6,
      METAMASK: 7,
      PROCESSING: 8,
      SUCCESS: 9,
      ERROR: 10
    }

    this.categoryList = listingSchemaMetadata.listingTypes.map(listingType => {
      listingType.name = props.intl.formatMessage(listingType.translationName)
      return listingType
    })

    this.defaultState = {
      boostCapTooLow: false,
      step: this.STEP.PICK_CATEGORY,
      selectedBoostAmount: props.wallet.ognBalance ? defaultBoostValue : 0,
      selectedCategory: null,
      selectedCategoryName: null,
      selectedCategorySchemas: null,
      selectedSchemaId: null,
      translatedSchema: null,
      schemaFetched: false,
      isFractionalListing: false,
      isEditMode: false,
      fractionalTimeIncrement: null,
      showNoCategorySelectedError: false,
      showNoSchemaSelectedError: false,
      formListing: {
        formData: {
          boostValue: defaultBoostValue,
          boostLevel: getBoostLevel(defaultBoostValue)
        }
      },
      showDetailsFormErrorMsg: false,
      showBoostFormErrorMsg: false,
      showBoostTutorial: false,
      verifyObj:JSON.stringify({verifyURL:'https://api.github.com/repos/OriginProtocol/origin/issues/1392',
        checkArg:'state',
        matchValue:'closed',
        verifyFee:'100'})
    }

    this.state = { ...this.defaultState }

    this.intlMessages = defineMessages({
      navigationWarning: {
        id: 'listing-create.navigationWarning',
        defaultMessage:
          'Are you sure you want to leave? If you leave this page your progress will be lost.'
      },
      boostLimit: {
         id: 'schema.boostLimitInOgn',
         defaultMessage: 'Boost Limit'
      },
      positiveNumber: {
        id: 'schema.positiveNumber',
        defaultMessage: 'should be a positive number'
      },
      notEnoughOgnFunds: {
        id: 'schema.notEnoughOgnFunds',
        defaultMessage: 'not enough funds in wallet.'
      },
      boostLimitTooHigh: {
        id: 'schema.boostLimitTooHigh',
        defaultMessage: 'value too high. Should be equal or smaller of the Total boost required.'
      },
      selectOne: {
        id: 'listing-create.selectOne',
        defaultMessage: 'Select One'
      },
      incorrectQuantity: {
        id: 'listing-create.incorrectQuantity',
        defaultMessage: 'Buyers have active (and finalized) purchases for {unitsInOffers} units. The quantity can not be lower than that.'
      }
    })

    this.boostSchema = {
      $schema: 'http://json-schema.org/draft-06/schema#',
      type: 'object',
      required: [],
      properties: {
        boostLimit: {
          type: 'number',
          title: this.props.intl.formatMessage(this.intlMessages.boostLimit)
        }
      }
    }

    this.checkOgnBalance = this.checkOgnBalance.bind(this)
    this.handleCategorySelection = this.handleCategorySelection.bind(this)
    this.handleCategorySelectNextBtn = this.handleCategorySelectNextBtn.bind(this)
    this.handleSchemaSelection = this.handleSchemaSelection.bind(this)
    this.renderDetailsForm = this.renderDetailsForm.bind(this)
    this.onDetailsEntered = this.onDetailsEntered.bind(this)
    this.onAvailabilityEntered = this.onAvailabilityEntered.bind(this)
    this.backFromBoostStep = this.backFromBoostStep.bind(this)
    this.backFromDetailsStep = this.backFromDetailsStep.bind(this)
    this.onFormDataChange = this.onFormDataChange.bind(this)
    this.onBoostLimitChange = this.onBoostLimitChange.bind(this)
    this.onReview = this.onReview.bind(this)
    this.pollOgnBalance = this.pollOgnBalance.bind(this)
    this.resetForm = this.resetForm.bind(this)
    this.resetToPreview = this.resetToPreview.bind(this)
    this.setBoost = this.setBoost.bind(this)
    this.ensureUserIsSeller = this.ensureUserIsSeller.bind(this)
    this.transformFormErrors = this.transformFormErrors.bind(this)
    this.updateBoostCap = this.updateBoostCap.bind(this)
    this.validateBoostForm = this.validateBoostForm.bind(this)
    this.validateListingForm = this.validateListingForm.bind(this)
  }

  async componentDidMount() {

    const { location } = this.props
    const query = queryString.parse(location.search)
    const showRequestListing = query['showRequestListing']

    if (showRequestListing)
    {
      sessionStorage.setItem("showRequestListing", showRequestListing)
    }

    // If listingId prop is passed in, we're in edit mode, so fetch listing data
    if (this.props.listingId) {
      this.props.storeWeb3Intent('edit a listing')

      try {
        // Pass false as second param so category doesn't get translated
        // because the form only understands the category ID, not the translated phrase
        const listing = await getListing(this.props.listingId, { translate: false, loadOffers: true })

        this.ensureUserIsSeller(listing.seller)
        const state = {
          formListing: {
            formData: {
              boostLimit: listing.totalBoostValue,
              ...listing
            }
          },
          selectedSchemaId: listing.dappSchemaId,
          selectedBoostAmount: listing.boostValue,
          isEditMode: true
        }

        if (listing.pictures.length) {
          const pictures = await getDataURIsFromImgURLs(listing.pictures)
          this.setState({
            ...state,
            formListing: {
              formData: { ...listing, pictures }
            }
          })
          this.renderDetailsForm(listing.schema)
          this.setState({ step: this.STEP.DETAILS })
        } else {
          this.setState(state)
          this.renderDetailsForm(listing.schema)
          this.setState({ step: this.STEP.DETAILS })
        }

      } catch (error) {
        console.error(`Error fetching contract or IPFS info for listing: ${this.props.listingId}`)
        console.error(error)
      }
    } else if (
      web3.currentProvider.isOrigin ||
      (this.props.messagingRequired && !this.props.messagingEnabled)
    ) {
      if (!origin.contractService.walletLinker) {
        this.props.history.push('/')
      }
      this.props.storeWeb3Intent('create a listing')
    }
  }

  ensureUserIsSeller(sellerAccount) {
    const { wallet } = this.props

    if (
      wallet.address &&
      formattedAddress(wallet.address) !== formattedAddress(sellerAccount)) {
      alert('⚠️ Only the seller can update a listing')
      window.location.href = '/'
    }
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
    !Number(this.props.wallet.ognBalance) &&
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

  handleCategorySelection(selectedCategory) {
    const trimmedCategory = selectedCategory.replace('schema.', '')
    const schemaArray = listingSchemaMetadata &&
      listingSchemaMetadata.listingSchemasByCategory &&
      listingSchemaMetadata.listingSchemasByCategory[trimmedCategory]
    const schemaArrayWithNames = schemaArray.map(schemaObj => {
      schemaObj.name = this.props.intl.formatMessage(schemaObj.translationName)
      return schemaObj
    })
    const selectedCategoryObj = listingSchemaMetadata.listingTypes.find(
      listingType => listingType.type === trimmedCategory
    )
    const stateToSet = {
      selectedCategory: trimmedCategory,
      selectedCategoryName: this.props.intl.formatMessage(selectedCategoryObj.translationName),
      selectedCategorySchemas: schemaArrayWithNames
    }

    if (this.props.mobileDevice) {
      stateToSet.step = this.STEP.PICK_SUBCATEGORY
      window.scrollTo(0, 0)
    }

    this.setState(stateToSet)
  }

  handleCategorySelectNextBtn() {
    // (The button that calls this method is only visibile on non-mobile devices)
    // check for category and schema selection and send to DETAILS step or show error
    if (!this.state.selectedCategory) {
      this.setState({
        showNoCategorySelectedError: true
      })
    } else if (!this.state.selectedSchemaId) {
      this.setState({
        showNoSchemaSelectedError: true
      })
    } else {
      this.setState({
        step: this.STEP.DETAILS,
        showNoCategorySelectedError: false,
        showNoSchemaSelectedError: false
      })
    }
  }

  handleSchemaSelection(e, selectedSchemaId) {
    let schemaFileName = selectedSchemaId

    // On desktop screen sizes, we use the onChange event of a <select> to call this method.
    if (!selectedSchemaId) {
      schemaFileName = e.target.value
    }

    return fetch(`schemas/${schemaFileName}`)
      .then(response => response.json())
      .then(schemaJson => {
        this.setState({ selectedSchemaId: schemaFileName })
        this.renderDetailsForm(schemaJson)
      })
  }

  renderDetailsForm(schemaJson) {
    PriceField.defaultProps = {
      options: {
        selectedSchema: schemaJson
      }
    }

    this.uiSchema = {
      slotLength: {
        'ui:widget': 'hidden'
      },
      slotLengthUnit: {
        'ui:widget': 'hidden'
      },
      examples: {
        'ui:widget': 'hidden'
      },
      sellerSteps: {
        'ui:widget': 'hidden'
      },
      price: {
        'ui:field': PriceField
      },
      weekdayPricing: {
        'ui:field': PriceField
      },
      weekendPricing: {
        'ui:field': PriceField
      },
      unitsTotal: {
        'ui:field': QuantityField
      },
      boostLimit: {
        'ui:field': BoostLimitField
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

    const { properties } = schemaJson

    const isFractionalListing = properties &&
      properties.listingType &&
      properties.listingType.const === 'fractional'

    const slotLength = properties &&
        properties.slotLength &&
        properties.slotLength.default

    const slotLengthUnit = properties &&
        properties.slotLengthUnit &&
        properties.slotLengthUnit.default

    const fractionalTimeIncrement = slotLengthUnit === 'schema.hours' ? 'hourly' : 'daily'

    if (isFractionalListing) {
      this.uiSchema.price = {
        'ui:widget': 'hidden'
      }
    }

    const schemaSetValues = {}
    for (const key in properties) {
      if (properties[key].const) {
        schemaSetValues[key] = properties[key].const
      }

      if (properties[key].default) {
        schemaSetValues[key] = properties[key].default
      }
    }

    if (this.state.isEditMode && isFractionalListing) {
      this.uiSchema = {
        ...this.uiSchema,
        ...{
          weekdayPricing: {
            'ui:widget': 'hidden'
          },
          weekendPricing: {
            'ui:widget': 'hidden'
          }
        }
      }
    }

    const translatedSchema = translateSchema(schemaJson)

    this.setState(prevState => ({
      schemaFetched: true,
      fractionalTimeIncrement,
      showNoSchemaSelectedError: false,
      translatedSchema,
      isFractionalListing,
      formListing: {
        formData: {
          ...prevState.formListing.formData,
          ...schemaSetValues,
          dappSchemaId: properties.dappSchemaId.const,
          category: properties.category.const,
          subCategory: properties.subCategory.const,
          slotLength,
          slotLengthUnit,
        }
      }
    }))
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

  onAvailabilityEntered(slots, direction) {
    let nextStep
    switch(direction) {
      case 'forward':
        this.state.isEditMode ?
          nextStep = 'PREVIEW' :
          nextStep = 'BOOST'
        break

      case 'back':
        nextStep = 'DETAILS'
        break
    }

    this.setState({
      formListing: {
        ...this.state.formListing,
        formData: {
          ...this.state.formListing.formData,
          availability: slots
        }
      },
      step: this.STEP[nextStep]
    })
  }

  backFromDetailsStep() {
    const step = this.props.mobileDevice ? this.STEP.PICK_SUBCATEGORY : this.STEP.PICK_CATEGORY

    this.setState({
      step,
      selectedSchema: null,
      schemaFetched: false,
      formListing: {
        ...this.state.formListing,
        formData: {
          ...this.state.formListing.formData,
          unitsTotal: 1
        }
      }
    })
  }

  backFromBoostStep() {
    const previousStep = this.state.isFractionalListing ? this.STEP.AVAILABILITY : this.STEP.DETAILS
    this.setState({ step: previousStep })
  }

  onDetailsEntered(formListing) {
    const [nextStep, listingType] = this.state.isFractionalListing ?
      [this.STEP.AVAILABILITY, 'fractional'] :
      this.state.isEditMode ?
        [this.STEP.PREVIEW, 'unit'] :
        [this.STEP.BOOST, 'unit']

    if (formListing.formData.weekdayPricing || formListing.formData.weekendPricing) {
      formListing.formData.availability = generateDefaultPricing(formListing.formData)
    }

    formListing.formData.listingType = listingType
    // multiUnit listings specify unitsTotal, others default to 1
    formListing.formData.unitsTotal = formListing.formData.unitsTotal || 1
    this.setState({
      formListing: {
        ...this.state.formListing,
        ...formListing,
        formData: {
          ...this.state.formListing.formData,
          ...formListing.formData
        }
      },
      step: nextStep,
      showDetailsFormErrorMsg: false,
      showBoostFormErrorMsg: false
    })
    window.scrollTo(0, 0)
    this.checkOgnBalance()
  }

  onFormDataChange({ formData }) {
  const pictures = picURIsOnly(formData.pictures)

    this.setState({
      formListing: {
        ...this.state.formListing,
        formData: {
          ...this.state.formListing.formData,
          ...formData,
          pictures
        }
      }
    })
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

  onBoostLimitChange({ formData }) {
    const boostLimit = formData.boostLimit
    if (boostLimit !== undefined && boostLimit !== this.state.formListing.formData.boostLimit
    ) {
      this.setState({
        formListing: {
          ...this.state.formListing,
          formData: {
            ...this.state.formListing.formData,
            boostLimit: formData.boostLimit
          }
        }
      })
      this.updateBoostCap()
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

    this.updateBoostCap()
  }

  /* This hack is required to be performed with delay, because boostLimit amount
   * is updated via setState with 1-2 frames of delay after the boost slider value
   * changes. When react renders the form inside those 2 frames the boostCapTooLow
   * message can appear for a short time and then dissapear. This workaround prevents
   * that sort of twitching.
   */
  updateBoostCap(){
    const formData = this.state.formListing.formData
    const boostAmount = formData.boostValue || this.state.selectedBoostAmount
    const requiredBoost = formData.unitsTotal * boostAmount

    if (this.updateBoostTimeout)
      clearTimeout(this.updateBoostTimeout)

    this.updateBoostTimeout = setTimeout(() => {
      this.setState({
        boostCapTooLow: requiredBoost > this.state.formListing.formData.boostLimit
      })
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

  async onOfferListing(formListing, verifyData) {
    const { isEditMode } = this.state
    this.setState({ step: this.STEP.METAMASK })
    const listing = dappFormDataToOriginListing(formListing.formData)
    if (this.props.marketplacePublisher) {
      listing['marketplacePublisher'] = this.props.marketplacePublisher
    }
    let transactionReceipt
    if (!isEditMode) {
      console.log("creating offer listing:", listing, " verifyData: ", verifyData)

      await origin.marketplace.offerListing(listing, 
        async (createdListing) => {
          const {
            boostValue,
            isMultiUnit,
            isFractional,
            listingType,
            price,
            boostRemaining
          } = await originToDAppListing(createdListing)

          let listingPrice = price
          if (isFractional) {
            const rawPrice = getTotalPriceFromJCal(jCal)
            listingPrice = `${Number(rawPrice).toLocaleString(undefined, {
              minimumFractionDigits: 5,
              maximumFractionDigits: 5
            })}`
          } else if (isMultiUnit) {
            listingPrice = new BigNumber(price).multipliedBy(quantity).toString()
          }
          const offerData = {
            listingId: createdListing.id,
            listingType: listingType,
            totalPrice: {
              amount: listingPrice,
              currency: 'ETH'
            },
            commission: {
              amount: boostValue.toString(),
              currency: 'OGN'
            },
            // Set the finalization time to ~1 year after the offer is accepted.
            // This is the window during which the buyer may file a dispute.
            finalizes: 365 * 24 * 60 * 60
          }

          if (isFractional) {
            //TODO: does commission change according to amount of slots bought?
            //TODO: actually support fractional offering
          } else if (isMultiUnit) {
            offerData.unitsPurchased = quantity
            /* If listing has enough boost remaining, take commission for each unit purchased.
             * In the case listing has ran out of boost, take up the remaining boost.
             */
            offerData.commission.amount = Math.min(boostValue * quantity, boostRemaining).toString()
          } else {
            offerData.unitsPurchased = 1
          }
          offerData.verifyTerms = verifyData
          return offerData
        }
      )
      this.setState({ step: this.STEP.SUCCESS })
      this.props.handleNotificationsSubscription('seller', this.props)
    }
  }

  async onSubmitListing(formListing) {
    const { isEditMode } = this.state

    try {
      this.setState({ step: this.STEP.METAMASK })
      const listing = dappFormDataToOriginListing(formListing.formData)
      if (this.props.marketplacePublisher) {
        listing['marketplacePublisher'] = this.props.marketplacePublisher
      }
      let transactionReceipt
      if (isEditMode) {
        transactionReceipt = await origin.marketplace.updateListing(
          this.props.listingId,
          listing,
          0, // TODO(John) - figure out how a seller would add "additional deposit"
          (confirmationCount, transactionReceipt) => {
            this.props.updateTransaction(confirmationCount, transactionReceipt)
          }
        )
      } else {
        const account = await origin.contractService.currentAccount()
        const balance = await web3.eth.getBalance(account)
        console.log("creating balance:", balance, " listing: ", listing)
        if (web3.utils.toBN(balance).lte(web3.utils.toBN(0)))
        {
          await origin.marketplace.injectListing(listing)
          this.setState({ step: this.STEP.SUCCESS })
          this.props.handleNotificationsSubscription('seller', this.props)
          return
        }
        else
        {
          transactionReceipt = await origin.marketplace.createListing(
            listing,
            (confirmationCount, transactionReceipt) => {
              this.props.updateTransaction(confirmationCount, transactionReceipt)
            }
          )
        }
      }

      const transactionTypeKey = isEditMode ? 'updateListing' : 'createListing'

      this.props.upsertTransaction({
        ...transactionReceipt,
        transactionTypeKey
      })
      this.props.getOgnBalance()
      this.setState({ step: this.STEP.SUCCESS })
      this.props.handleNotificationsSubscription('seller', this.props)
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

  renderBoostButtons(isMultiUnitListing) {
    return(
      <div className="btn-container">
        <button
          type="button"
          className="btn btn-other btn-listing-create"
          onClick={this.backFromBoostStep}
          ga-category="create_listing"
          ga-label="boost_listing_step_back"
        >
          <FormattedMessage
            id={'backButtonLabel'}
            defaultMessage={'Back'}
          />
        </button>
        <button
          type={isMultiUnitListing ? 'submit' : undefined}
          className="float-right btn btn-primary btn-listing-create"
          onClick={isMultiUnitListing ? undefined : this.onReview}
          ga-category="create_listing"
          ga-label="boost_listing_step_continue"
        >
          <FormattedMessage
            id={'listing-create.review'}
            defaultMessage={'Review'}
          />
        </button>
      </div>
    )
  }

  transformFormErrors(errors) {
    return errors.map(error => {
      if (error.property === '.unitsTotal') {
        error.message = this.props.intl.formatMessage(this.intlMessages.positiveNumber)
      }
      return error
    })
  }

  validateBoostForm(data, errors) {
    const formData = this.state.formListing.formData
    // clear errors
    errors.boostLimit.__errors = []
    let boostLimit = formData.boostLimit
    // if a Nan set to -1 so it triggers the 'positiveNumber' error
    boostLimit = isNaN(boostLimit) ? -1 : parseFloat(boostLimit)

    let errorFound = false
    if (this.props.wallet.ognBalance < boostLimit) {
      errorFound = true
      errors.boostLimit.addError(this.props.intl.formatMessage(this.intlMessages.notEnoughOgnFunds))
    }
    if (boostLimit < 0) {
      errorFound = true
      errors.boostLimit.addError(this.props.intl.formatMessage(this.intlMessages.positiveNumber))
    }

    if (boostLimit > formData.unitsTotal * formData.boostValue) {
      errorFound = true
      errors.boostLimit.addError(this.props.intl.formatMessage(this.intlMessages.boostLimitTooHigh))
    }

    if (!errorFound){
      this.setState({
        showBoostFormErrorMsg: false
      })
    }
    return errors
  }

  validateListingForm(data, errors) {
    const {
      isEditMode,
      formListing
    } = this.state

    const formData = formListing.formData
    const {
      unitsTotal,
      unitsPending,
      unitsSold
    } = formData

    if (isEditMode) {
      const unitsLockedInOffers = unitsPending + unitsSold
      /* considers the case where a user would edit the quantity to 1 on a multi unit listing
       * that already has offers for more than 1 unit.
       */
      const isMultiUnitListing = (!!formData.unitsTotal && formData.unitsTotal) > 1 || unitsLockedInOffers > 1

      // do not allow quantity to be edited below the value of units already in offers
      if (isMultiUnitListing && unitsTotal < unitsLockedInOffers) {
        errors.unitsTotal.addError(
          this.props.intl.formatMessage(
            this.intlMessages.incorrectQuantity,
            {
              unitsInOffers: unitsLockedInOffers
            }
          )
        )
      }
    }

    return errors
  }

  getStepNumber(stepNum) {
    // We have a different number of steps in the workflow based on
    // mobile vs. desktop and fractional vs. unit.
    // This method ensures that the step numbers that display at the top of the view are correct
    const isMobile = this.props.mobileDevice
    const { isFractionalListing } = this.state

    switch (stepNum) {
      case 1:
        return 1
      case 2:
      case 3:
      case 4:
        return isMobile ? stepNum : stepNum - 1
      case 5:
      case 6:
          if (isMobile) {
            return isFractionalListing ? stepNum : stepNum - 1
          } else {
            return isFractionalListing ? stepNum - 1 : stepNum - 2
          }
    }
  }

  render() {
    const {
      wallet,
      intl
    } = this.props
    const {
      boostCapTooLow,
      formListing,
      fractionalTimeIncrement,
      selectedBoostAmount,
      selectedCategory,
      selectedCategoryName,
      selectedCategorySchemas,
      showNoCategorySelectedError,
      selectedSchemaId,
      showNoSchemaSelectedError,
      step,
      translatedSchema,
      showDetailsFormErrorMsg,
      showBoostFormErrorMsg,
      showBoostTutorial,
      isFractionalListing,
      isEditMode
    } = this.state
    const totalNumberOfSteps = isFractionalListing ? 5 : 4
    const { formData } = formListing
    const usdListingPrice = getFiatPrice(formListing.formData.price, 'USD')
    const boostAmount = formData.boostValue || selectedBoostAmount
    const isMultiUnitListing = !!formData.unitsTotal && formData.unitsTotal > 1
    const category = translateListingCategory(formData.category)
    const subCategory = translateListingCategory(formData.subCategory)
    const stepNumber = this.getStepNumber(step)

    return (!web3.currentProvider.isOrigin || origin.contractService.walletLinker) ? (
      <div className="listing-form">
        <div className="step-container">
          <div className="row">
            {step === this.STEP.PICK_CATEGORY && (
              <div className="col-md-6 col-lg-5 pick-schema">
                <label>
                  <FormattedMessage
                    id={'listing-create.stepNumberLabel'}
                    defaultMessage={'STEP {stepNumber}'}
                    values={{ stepNumber: stepNumber }}
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
                <StepsProgress
                  stepsTotal={totalNumberOfSteps}
                  stepCurrent={stepNumber}
                />
                <div className="schema-options">
                  {this.categoryList.map(category => (
                    <div
                      className={`schema-selection${
                        selectedCategory === category.type ? ' selected' : ''
                      }`}
                      key={category.type}
                      onClick={() => this.handleCategorySelection(category.type)}
                      ga-category="create_listing"
                      ga-label={ `select_category_${category.type}`}
                    >
                      <div className="category-icon-container">
                        <img src={`images/${category.img}`} role="presentation" />
                      </div>
                      {category.name}
                      {!this.props.mobileDevice && selectedCategory === category.type &&
                        <select
                          onChange={this.handleSchemaSelection}
                          value={selectedSchemaId || undefined}
                          className="form-control"
                        >
                          <option value="">{intl.formatMessage(this.intlMessages.selectOne)}</option>
                          {selectedCategorySchemas.map(schemaObj => (
                            <option value={schemaObj.schema} key={schemaObj.name}>{schemaObj.name}</option>
                          ))}
                        </select>
                      }
                    </div>
                  ))}
                  {showNoCategorySelectedError && (
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
                {!this.props.mobileDevice &&
                  <div className="btn-container">
                    <button
                      className="float-right btn btn-primary btn-listing-create"
                      onClick={() => this.handleCategorySelectNextBtn()}
                      ga-category="create_listing"
                      ga-label="select_category_step_continue"
                    >
                      <FormattedMessage
                        id={'listing-create.next'}
                        defaultMessage={'Next'}
                      />
                    </button>
                  </div>
                }
              </div>
            )}
            {/* NOTE: PICK_SUBCATEGORY is a mobile-only step */}
            {step === this.STEP.PICK_SUBCATEGORY && (
              <div className="col-md-6 col-lg-5 pick-schema">
                <label>
                  <FormattedMessage
                    id={'listing-create.stepNumberLabel'}
                    defaultMessage={'STEP {stepNumber}'}
                    values={{ stepNumber: stepNumber }}
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
                <button
                  onClick={() => this.setState({
                    step: this.STEP.PICK_CATEGORY,
                    selectedSchemaId: null
                  })}
                  className="mobile-back-btn"
                >
                  <img src="images/caret-grey.svg" />
                  <FormattedMessage
                    id={'listing-create.backButtonLabel'}
                    defaultMessage={'Back'}
                  />
                </button>
                <h3>{selectedCategoryName}</h3>
                <div className="schema-options">
                  {selectedCategorySchemas.map(schemaObj => (
                    <div
                      className={`schema-selection mobile${
                        selectedSchemaId === schemaObj.schema ? ' selected' : ''
                      }`}
                      key={schemaObj.schema}
                      onClick={e => this.handleSchemaSelection(e, schemaObj.schema)}
                      ga-category="create_listing"
                      ga-label={ `select_schema_${schemaObj.schema}`}
                    >
                      {schemaObj.name}
                    </div>
                  ))}
                </div>
                {selectedSchemaId &&
                  <div className="btn-container mobile">
                    <button
                      className="float-right btn btn-primary btn-listing-create"
                      onClick={() => this.goToDetailsStep()}
                      ga-category="create_listing"
                      ga-label="select_category_step_continue"
                    >
                      <FormattedMessage
                        id={'listing-create.continue'}
                        defaultMessage={'Continue'}
                      />
                    </button>
                  </div>
                }
              </div>
            )}
            {step === this.STEP.DETAILS && (
              <div className="col-md-6 col-lg-5 schema-details">
                <label>
                  <FormattedMessage
                    id={'listing-create.stepNumberLabel'}
                    defaultMessage={'STEP {stepNumber}'}
                    values={{ stepNumber: stepNumber }}
                  />
                </label>
                <h2>
                  <FormattedMessage
                    id={'listing-create.createListingHeading'}
                    defaultMessage={'Listing Details'}
                  />
                </h2>
                <StepsProgress
                  stepsTotal={totalNumberOfSteps}
                  stepCurrent={stepNumber}
                />
                <Form
                  schema={translatedSchema}
                  onSubmit={this.onDetailsEntered}
                  formData={formListing.formData}
                  onError={(error) => {
                    console.error('Listing form errors: ', error)
                    this.setState({ showDetailsFormErrorMsg: true })
                  }}
                  onChange={this.onFormDataChange}
                  uiSchema={this.uiSchema}
                  transformErrors={this.transformFormErrors}
                  formContext={{
                    isMultiUnitListing: isMultiUnitListing
                  }}
                  validate={this.validateListingForm}
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
                        this.backFromDetailsStep()
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
            {step === this.STEP.AVAILABILITY &&
              <Fragment>
                <div className="col-md-6 col-lg-5">
                  <label>
                    <FormattedMessage
                      id={'listing-create.stepNumberLabel'}
                      defaultMessage={'STEP {stepNumber}'}
                      values={{ stepNumber: this.getStepNumber(step) }}
                    />
                  </label>
                  <h2>
                    <FormattedMessage
                      id={'listing-create.availabilityHeading'}
                      defaultMessage={'Pricing & Availability'}
                    />
                  </h2>
                  <StepsProgress
                    stepsTotal={totalNumberOfSteps}
                    stepCurrent={stepNumber}
                  />
                </div>
                <div className="col-md-12 listing-availability">
                  <Calendar
                    slots={formData && formData.availability}
                    userType="seller"
                    viewType={fractionalTimeIncrement}
                    step={60}
                    onComplete={(slots) => this.onAvailabilityEntered(slots, 'forward')}
                    onGoBack={(slots) => this.onAvailabilityEntered(slots, 'back')}
                  />
                </div>
              </Fragment>
            }
            {step === this.STEP.BOOST && (
              <div className="col-md-6 col-lg-5 select-boost">
                <label>
                  <FormattedMessage
                    id={'listing-create.stepNumberLabel'}
                    defaultMessage={'STEP {stepNumber}'}
                    values={{ stepNumber: stepNumber }}
                  />
                </label>
                <h2>
                  <FormattedMessage
                    id={'listing-create.boost-your-listing'}
                    defaultMessage={'Boost Your Listing'}
                  />
                </h2>
                <StepsProgress
                  stepsTotal={totalNumberOfSteps}
                  stepCurrent={stepNumber}
                />
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
                            <Link
                              to="/about-tokens"
                              target="_blank"
                              rel="noopener noreferrer"
                              ga-category="create_listing"
                              ga-label="boost_listing_step_ogn"
                            >
                              OGN
                            </Link>
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
                      <Link
                        to="/about-tokens"
                        target="_blank"
                        rel="noopener noreferrer"
                        ga-category="create_listing"
                        ga-label="boost_listing_step_learn_more"
                      >
                        Learn More
                      </Link>
                    </div>
                  </div>
                )}
                {!showBoostTutorial && (
                  <Fragment>
                    <BoostSlider
                      onChange={this.setBoost}
                      ognBalance={wallet.ognBalance}
                      selectedBoostAmount={boostAmount}
                      isMultiUnitListing={isMultiUnitListing}
                    />
                    {isMultiUnitListing && (
                      <Fragment>
                        <Form
                          className="rjsf mt-2"
                          schema={this.boostSchema}
                          onError={() => {
                            this.setState({ showBoostFormErrorMsg: true })
                          }}
                          onSubmit={this.onReview}
                          onChange={this.onBoostLimitChange}
                          uiSchema={this.uiSchema}
                          formContext={{
                            formData: formData,
                            wallet: this.props.wallet
                          }}
                          transformErrors={this.transformFormErrors}
                          validate={this.validateBoostForm}
                        >
                          <div className="boost-info p-4">
                            <p className="boost-text boost-italic mt-4 mb-0">
                              <FormattedMessage
                                id={'listing-create.totalNumberOfUnits'}
                                defaultMessage={'Total number of units: {units}'}
                                values={{
                                  units: formData.unitsTotal
                                }}
                              />
                            </p>
                            <p className="boost-text boost-italic mt-1">
                              <FormattedMessage
                                id={'listing-create.totalBoostRequired'}
                                defaultMessage={'Total boost required: {boost}'}
                                values={{
                                  boost: (
                                  <Fragment>{formData.unitsTotal * boostAmount}&nbsp;
                                      <Link
                                        className="ogn-abbrev"
                                        to="/about-tokens"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                      >
                                        OGN
                                      </Link>
                                    </Fragment>)
                                }}
                              />
                            </p>
                            {boostCapTooLow && <p className="boost-text mt-4">
                              <FormattedMessage
                                id={'listing-create.boostCapTooLow'}
                                defaultMessage={'Your boost limit is lower than the total amount needed to boost all your units. After the limit is reached, the remaining units will not be boosted.'}
                              />
                            </p>}
                          </div>
                          {showBoostFormErrorMsg && (
                            <div className="info-box warn">
                              <p>
                                <FormattedMessage
                                  id={'listing-create.showBoostFormErrorMsg'}
                                  defaultMessage={
                                    'Please fix errors before continuing.'
                                  }
                                />
                              </p>
                            </div>
                          )}
                          {this.renderBoostButtons(true)}
                        </Form>
                      </Fragment>
                    )}
                  </Fragment>
                )}
                {(showBoostTutorial || !showBoostTutorial && !isMultiUnitListing) && this.renderBoostButtons(false)}
              </div>
            )}
            {step >= this.STEP.PREVIEW && (
              <div className="col-md-7 col-lg-8 listing-preview">
                <label className="create-step">
                  <FormattedMessage
                    id={'listing-create.stepNumberLabel'}
                    defaultMessage={'STEP {stepNumber}'}
                    values={{ stepNumber: stepNumber }}
                  />
                </label>
                <h2>
                  <FormattedMessage
                    id={'listing-create.reviewListingHeading'}
                    defaultMessage={'Review your listing'}
                  />
                </h2>
                <StepsProgress
                  stepsTotal={totalNumberOfSteps}
                  stepCurrent={stepNumber}
                />
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
                      <p>{category}</p>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-3">
                      <p className="label">
                        <FormattedMessage
                          id={'listing-create.subcategory'}
                          defaultMessage={'Subcategory'}
                        />
                      </p>
                    </div>
                    <div className="col-md-9">
                      <p>{subCategory}</p>
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
                  {isMultiUnitListing &&
                    <div className="row">
                      <div className="col-md-3">
                        <p className="label">
                          <FormattedMessage
                            id={'listing-create.quantity'}
                            defaultMessage={'Quantity'}
                          />
                        </p>
                      </div>
                      <div className="col-md-9">
                        <p>
                          {formData.unitsTotal}
                        </p>
                      </div>
                    </div>
                  }
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
                        {isFractionalListing &&
                          <FormattedMessage
                            id={'listing-create.fractional-price-varies'}
                            defaultMessage={'Price varies by date'}
                          />
                        }
                        {!isFractionalListing &&
                          <Fragment>
                            <img
                              className="eth-icon"
                              src="images/eth-icon.svg"
                              role="presentation"
                            />
                            <span className="text-bold">
                              {isFractionalListing &&
                                'Varies by date'
                              }
                              {!isFractionalListing &&
                                Number(formData.price).toLocaleString(undefined, {
                                  minimumFractionDigits: 5,
                                  maximumFractionDigits: 5
                                })
                              }
                            </span>&nbsp;
                            <a
                              className="eth-abbrev"
                              href="https://en.wikipedia.org/wiki/Ethereum"
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
                          </Fragment>
                        }
                      </p>
                    </div>
                  </div>
                  {!isEditMode &&
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
                          <Link
                            className="ogn-abbrev"
                            to="/about-tokens"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            OGN
                          </Link>
                          <span className="help-block">
                            &nbsp;| {formData.boostLevel.toUpperCase()}
                          </span>
                        </p>
                      </div>
                    </div>
                  }
                  {isMultiUnitListing && !isEditMode &&
                    <div className="row">
                      <div className="col-md-3">
                        <p className="label">
                          <FormattedMessage
                            id={'listing-create.boostLimit'}
                            defaultMessage={'Boost Limit'}
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
                          <span className="text-bold">{formData.boostLimit}</span>&nbsp;
                          <Link
                            className="ogn-abbrev"
                            to="/about-tokens"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            OGN
                          </Link>
                        </p>
                      </div>
                    </div>
                  }
                  <div className="row">
                    <div className="col-md-3">
                      <p className="label">Photos</p>
                    </div>
                    <div className="col-md-9 photo-row">
                      {formData.pictures &&
                        formData.pictures.map((dataUri, idx) => (
                          <img
                            key={idx}
                            src={dataUri}
                            className="photo"
                            role="presentation"
                          />
                        ))}
                    </div>
                  </div>
                </div>
                {/* Revisit this later
                  <Link
                    className="bottom-cta"
                    to="#"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Preview in browser
                  </Link>
                */}
                <div className="btn-container">
                  <button
                    className="btn btn-other float-left btn-listing-create"
                    onClick={() => {
                      const step = isEditMode ?
                        isFractionalListing ?
                          this.STEP.AVAILABILITY :
                          this.STEP.DETAILS
                        : this.STEP.BOOST
                      this.setState({ step })
                    }}
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
              {sessionStorage.getItem("showRequestListing") && <div className="d-block">
                <textarea style={{width:'100%'}} value={this.state.verifyObj} onChange={ (e) => {this.setState({verifyObj:e.target.value});}  }/>
                  <button
                    className="btn btn-primary float-right btn-listing-create"
                    onClick={() => this.onOfferListing(formListing, JSON.parse(this.state.verifyObj))}
                    ga-category="create_listing"
                    ga-label="review_step_done"
                  >
                    <FormattedMessage
                      id={'listing-create.offerButtonLabel'}
                      defaultMessage={'I want this'}
                    />
                  </button>
                </div>}
              </div>
            )}
            {step !== this.STEP.AVAILABILITY &&
              <div
                className={`pt-xs-4 pt-sm-4 col-md-5 col-lg-4${
                  step >= this.STEP.PREVIEW ? '' : ' offset-md-1 offset-lg-3'
                }`}
              >
                <WalletCard
                  {...wallet}
                  withBalanceTooltip={!this.props.wallet.ognBalance}
                  withMenus={true}
                  withProfile={false}
                />
                {step === this.STEP.PICK_SUBCATEGORY && (
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
                        defaultMessage={`Be sure to give your listing an appropriate title and description to let others know what you're offering. Adding some photos will increase the chances of selling your listing.`}
                      />
                    </p>
                    {isFractionalListing && (
                      <p>
                        <FormattedMessage
                          id={'listing-create.form-help-details-fractional'}
                          defaultMessage={`You will be able to customize pricing and availability in the next step.`}
                        />
                      </p>
                    )}
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
                      <Link
                        to="/about-tokens"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <FormattedMessage
                          id={'listing-create.learn-more'}
                          defaultMessage={'Learn More'}
                        />
                      </Link>
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
                      {!!selectedBoostAmount && (
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
            }
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
                  {isEditMode &&
                    <FormattedMessage
                      id={'listing-create.updateSuccessMessage'}
                      defaultMessage={'Your listing has been updated!'}
                    />
                  }
                  {!isEditMode &&
                    <FormattedMessage
                      id={'listing-create.successMessage'}
                      defaultMessage={'Your listing has been created!'}
                    />
                  }
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
                    ga-label="listing_creation_confirmation_modal_create_another_listing_cta"
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
                    ga-label="listing_creation_confirmation_modal_see_all_listings"
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
          when={step !== this.STEP.PICK_CATEGORY && step !== this.STEP.SUCCESS}
          message={intl.formatMessage(this.intlMessages.navigationWarning)}
        />
      </div>
    ) : null
  }
}

const mapStateToProps = ({ activation, app, config, exchangeRates, wallet }) => {
  return {
    exchangeRates,
    marketplacePublisher: config.marketplacePublisher,
    messagingEnabled: activation.messaging.enabled,
    messagingRequired: app.messagingRequired,
    notificationsHardPermission: activation.notifications.permissions.hard,
    notificationsSoftPermission: activation.notifications.permissions.soft,
    pushNotificationsSupported: activation.notifications.pushEnabled,
    serviceWorkerRegistration: activation.notifications.serviceWorkerRegistration,
    wallet,
    web3Intent: app.web3.intent,
    mobileDevice: app.mobileDevice
  }
}

const mapDispatchToProps = dispatch => ({
  handleNotificationsSubscription: (role, props) => dispatch(handleNotificationsSubscription(role, props)),
  showAlert: msg => dispatch(showAlert(msg)),
  updateTransaction: (hash, confirmationCount) =>
    dispatch(updateTransaction(hash, confirmationCount)),
  upsertTransaction: transaction => dispatch(upsertTransaction(transaction)),
  getOgnBalance: () => dispatch(getOgnBalance()),
  storeWeb3Intent: intent => dispatch(storeWeb3Intent(intent))
})

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(
    injectIntl(ListingCreate)
  )
)
