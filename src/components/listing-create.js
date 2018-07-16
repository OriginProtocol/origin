import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'
import moment from 'moment'
import { FormattedMessage, defineMessages, injectIntl } from 'react-intl'
import { translateSchema } from '../utils/translationUtils'
import origin from '../services/origin'
import getCurrentProvider from '../utils/getCurrentProvider'

import { showAlert } from '../actions/Alert'

import ListingDetail from './listing-detail'
import Form from 'react-jsonschema-form'
import Modal from './modal'
import Calendar from './calendar'

const generateCalendarSlots = (events) => {
  for (let i = 0, eventsLen = events.length; i < eventsLen; i++) {
    const event = events[i]
    const startDate = new Date(event.startDate)
    const endDate = new Date(event.endDate)
    let eventDate = moment(event.startDate)
    const slots = []

    // convert start and end date strings in to date objects
    event.startDate = startDate
    event.endDate = endDate

    while (eventDate.toDate() >= startDate && eventDate.toDate() <= endDate) {
        slots.push(eventDate.toDate())
        eventDate = eventDate.add(1, 'days')
    }

    event.slots = slots
  }

  return events
}

class ListingCreate extends Component {

  constructor(props) {
    super(props)

    // This is non-ideal fix until IPFS can correctly return 443 errors
    // Server limit is 2MB, with 100K safety buffer
    this.MAX_UPLOAD_BYTES = (2e6 - 1e5)

    // Enum of our states
    this.STEP = {
      PICK_SCHEMA: 1,
      DETAILS: 2,
      AVAILABILITY: 3,
      PREVIEW: 4,
      METAMASK: 5,
      PROCESSING: 6,
      SUCCESS: 7,
      ERROR: 8
    }

    this.fractionalSchemaTypes = [
      'housing',
      'services'
    ]

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
      {type: 'for-sale', name: props.intl.formatMessage(schemaTypeLabels.forSale), 'img': 'for-sale.jpg'},
      {type: 'housing', name: props.intl.formatMessage(schemaTypeLabels.housing), 'img': 'housing.jpg'},
      {type: 'transportation', name: props.intl.formatMessage(schemaTypeLabels.transportation), 'img': 'transportation.jpg'},
      {type: 'tickets', name: props.intl.formatMessage(schemaTypeLabels.tickets), 'img': 'tickets.jpg'},
      {type: 'services', name: props.intl.formatMessage(schemaTypeLabels.services), 'img': 'services.jpg'},
      {type: 'announcements', name: props.intl.formatMessage(schemaTypeLabels.announcements), 'img': 'announcements.jpg'},
    ]

    this.state = {
      step: this.STEP.PICK_SCHEMA,
      selectedSchemaType: this.schemaList[0],
      selectedSchema: null,
      schemaFetched: false,
      formData: null,
      isFractionalListing: false,
      currentProvider: getCurrentProvider(origin && origin.contractService && origin.contractService.web3),
      isEditMode: false,
      fractionalTimeIncrement: null
    }

    this.handleSchemaSelection = this.handleSchemaSelection.bind(this)
    this.onDetailsEntered = this.onDetailsEntered.bind(this)
    this.onAvailabilityEntered = this.onAvailabilityEntered.bind(this)
    this.getCalendarStep = this.getCalendarStep.bind(this)
  }

  async componentDidMount() {
    if (this.props.listingAddress) {
      try {
        const listing = await origin.listings.get(this.props.listingAddress)

        this.setState({ selectedSchemaType: listing.schemaType })

        await this.handleSchemaSelection()

        listing.slots = generateCalendarSlots(listing.slots)

        this.setState({
          formData: listing,
          step: this.STEP.DETAILS,
          isEditMode: true
        })
      } catch (error) {
        console.error(`Error fetching contract or IPFS info for listing: ${this.props.listingAddress}`)
        console.error(error)
      }
    }
  }

  async handleSchemaSelection() {
    const { selectedSchemaType } = this.state
    const isFractionalListing = this.fractionalSchemaTypes.includes(selectedSchemaType)

    this.setState({ isFractionalListing })

    await fetch(`schemas/${selectedSchemaType}.json`)
    .then((response) => response.json())
    .then((schemaJson) => {
      this.setState({
        selectedSchema: schemaJson,
        schemaFetched: true,
        step: this.STEP.DETAILS,
        fractionalTimeIncrement: (selectedSchemaType === 'housing' ? 'daily' : 'hourly')
      })
      window.scrollTo(0, 0)
    })
  }

  onDetailsEntered(formListing) {
    const { formData } = formListing
    // Helper function to approximate size of object in bytes
    function roughSizeOfObject( object ) {
      var objectList = []
      var stack = [object]
      var bytes = 0
      while (stack.length) {
        var value = stack.pop()
        if (typeof value === 'boolean') {
          bytes += 4
        } else if (typeof value === 'string') {
          bytes += value.length * 2
        } else if (typeof value === 'number') {
          bytes += 8
        }
        else if (typeof value === 'object'
          && objectList.indexOf(value) === -1)
        {
          objectList.push(value)
          for (var i in value) {
            if (value.hasOwnProperty(i)) {
              stack.push(value[i])
            }
          }
        }
      }
      return bytes
    }
    if (roughSizeOfObject(formData) > this.MAX_UPLOAD_BYTES) {
      this.props.showAlert("Your listing is too large. Consider using fewer or smaller photos.")
    } else {

      const [nextStep, listingType] = this.state.isFractionalListing ?
                                        [this.STEP.AVAILABILITY, 'fractional'] :
                                        [this.STEP.PREVIEW, 'unit']

      formData.listingType = listingType
      formData.schemaType = this.state.selectedSchemaType

      this.setState({
        formData,
        step: nextStep
      })

      window.scrollTo(0, 0)

    }
  }

  onAvailabilityEntered(slots) {
    slots.forEach((slot) => {
      if (typeof slot.priceWei !== 'number') {
        delete slot.priceWei
      }
    })

    this.setState({
      formData: {
        ...this.state.formData,
        timeIncrement: this.state.fractionalTimeIncrement,
        slots
      }
    })

    this.setState({
      step: this.STEP.PREVIEW
    })
  }

  async onSubmitListing(formData, selectedSchemaType) {
    try {
      console.log(formData)
      this.setState({ step: this.STEP.METAMASK })

      let transactionReceipt

      if (this.state.isEditMode) {
        transactionReceipt = await origin.listings.update(this.props.listingAddress, formData)
      } else {
        transactionReceipt = await origin.listings.create(formData, selectedSchemaType)
      }
      
      this.setState({ step: this.STEP.PROCESSING })
      // Submitted to blockchain, now wait for confirmation
      await origin.contractService.waitTransactionFinished(transactionReceipt.transactionHash)
      this.setState({ step: this.STEP.SUCCESS })
    } catch (error) {
      console.error(error)
      this.setState({ step: this.STEP.ERROR })
    }
  }

  resetToPreview() {
    this.setState({ step: this.STEP.PREVIEW })
  }

  getCalendarStep() {
    const stepValue = this.state.formData.calendarStep && this.state.formData.calendarStep.slice(-2)
    return parseInt(stepValue || 60)
  }

  render() {
    const { selectedSchema } = this.state
    const enumeratedPrice = selectedSchema &&
                            selectedSchema.properties['priceWei'] &&
                            selectedSchema.properties['priceWei'].enum
    const priceHidden = enumeratedPrice && enumeratedPrice.length === 1 && enumeratedPrice[0] === 0

    return (
      <div className="container listing-form">
        { this.state.step === this.STEP.PICK_SCHEMA &&
          <div className="step-container pick-schema">
            <div className="row flex-sm-row-reverse">
             <div className="col-md-5 offset-md-2">
                <div className="info-box">
                  <h2>
                    <FormattedMessage
                      id={ 'listing-create.chooseSchema' }
                      defaultMessage={ 'Choose a schema for your product or service' }
                    />
                  </h2>
                  <p>
                    <FormattedMessage
                      id={ 'listing-create.schemaExplainer' }
                      defaultMessage={ 'Your product or service will use a schema to describe its attributes like name, description, and price. Origin already has multiple schemas that map to well-known categories of listings like housing, auto, and services.' }
                    />
                  </p>
                  <div className="info-box-image"><img className="d-none d-md-block" src="images/features-graphic.svg" role="presentation" /></div>
                </div>
              </div>

              <div className="col-md-5">
                <label>
                  <FormattedMessage
                    id={ 'listing-create.stepNumberLabel' }
                    defaultMessage={ 'STEP {stepNumber}' }
                    values={{ stepNumber: Number(this.state.step) }}
                  />
                </label>
                <h2>
                  <FormattedMessage
                    id={ 'listing-create.whatTypeOfListing' }
                    defaultMessage={ 'What type of listing do you want to create?' }
                  />
                </h2>
                <div className="schema-options">
                  {this.schemaList.map(schema => (
                    <div
                      className={
                        this.state.selectedSchemaType === schema.type ?
                        'schema-selection selected' : 'schema-selection'
                      }
                      key={schema.type}
                      onClick={() => this.setState({selectedSchemaType:schema.type})}
                    >
                      {schema.name}
                    </div>
                  ))}
                </div>
                <div className="btn-container">
                  <button className="float-right btn btn-primary" onClick={() => this.handleSchemaSelection()}>
                    <FormattedMessage
                      id={ 'listing-create.next' }
                      defaultMessage={ 'Next' }
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        }
        { this.state.step === this.STEP.DETAILS &&
          <div className="step-container schema-details">
            <div className="row flex-sm-row-reverse">
               <div className="col-md-5 offset-md-2">
                  <div className="info-box">
                    <div>
                      <h2>
                        <FormattedMessage
                          id={ 'listing-create.howItWorksHeading' }
                          defaultMessage={ 'How it works' }
                        />
                      </h2>
                      <FormattedMessage
                        id={ 'listing-create.howItWorksContentPart1' }
                        defaultMessage={ 'Origin uses a Mozilla project called {jsonSchemaLink}  to validate your listing according to standard rules. This standardization is key to allowing unaffiliated entities to read and write to the same data layer.' }
                        values={{ 
                          jsonSchemaLink: <FormattedMessage id={ 'listing-create.jsonSchema' } defaultMessage={ 'JSONSchema' } />
                        }}
                      />
                      <br/><br/>
                      <FormattedMessage
                        id={ 'listing-create.howItWorksContentPart2' }
                        defaultMessage={ 'Be sure to give your listing an appropriate title and description that will inform others as to what you’re offering.' }
                        values={{ 
                          jsonSchemaLink: <FormattedMessage id={ 'listing-create.jsonSchema' } defaultMessage={ 'JSONSchema' } />
                        }}
                      />
                      <a href={`schemas/${this.state.selectedSchemaType}.json`} target="_blank">
                        <FormattedMessage
                          id={ 'listing-create.viewSchemaLinkLabel' }
                          defaultMessage={ 'View the {schemaName} schema' }
                          values={{ 
                            schemaName: <code>{this.state.selectedSchema && this.state.selectedSchema.name}</code>
                          }}
                        />
                      </a>
                    </div>
                    <div className="info-box-image"><img className="d-none d-md-block" src="images/features-graphic.svg" role="presentation" /></div>
                  </div>
                </div>
              <div className="col-md-5">
                <label>
                  <FormattedMessage
                    id={ 'listing-create.stepNumberLabel' }
                    defaultMessage={ 'STEP {stepNumber}' }
                    values={{ stepNumber: Number(this.state.step) }}
                  />
                </label>
                <h2>
                  <FormattedMessage
                    id={ 'listing-create.createListingHeading' }
                    defaultMessage={ 'Create your listing' }
                  />
                </h2>
                <Form
                  schema={translateSchema(this.state.selectedSchema, this.state.selectedSchemaType)}
                  onSubmit={this.onDetailsEntered}
                  formData={this.state.formData}
                  onError={(errors) => console.log(`react-jsonschema-form errors: ${errors.length}`)}
                  uiSchema={priceHidden ? { priceWei: { 'ui:widget': 'hidden' } } : undefined}
                >
                  <div className="btn-container">
                    <button type="button" className="btn btn-other" onClick={() => this.setState({step: this.STEP.PICK_SCHEMA})}>
                      <FormattedMessage
                        id={ 'backButtonLabel' }
                        defaultMessage={ 'Back' }
                      />
                    </button>
                    <button type="submit" className="float-right btn btn-primary">
                      <FormattedMessage
                        id={ 'continueButtonLabel' }
                        defaultMessage={ 'Continue' }
                      />
                    </button>
                  </div>
                </Form>

              </div>
              <div className="col-md-6">
              </div>
            </div>
          </div>
        }
        { (this.state.step === this.STEP.AVAILABILITY) &&
          <div className="step-container listing-availability">
            <Calendar
              slots={ this.state.formData && this.state.formData.slots }
              userType="seller"
              viewType={ this.state.fractionalTimeIncrement }
              step={ this.getCalendarStep() }
              onComplete={ this.onAvailabilityEntered }
            />
          </div>
        }
        { (this.state.step >= this.STEP.PREVIEW) &&
          <div className="step-container listing-preview">
            {this.state.step === this.STEP.METAMASK &&
              <Modal backdrop="static" isOpen={true}>
                <div className="image-container">
                  <img src="images/spinner-animation.svg" role="presentation"/>
                </div>
                <FormattedMessage
                  id={ 'listing-create.confirmTransaction' }
                  defaultMessage={ 'Confirm transaction' }
                />
                <br />
                <FormattedMessage
                  id={ 'listing-create.pressSubmitInMetaMask' }
                  defaultMessage={ 'Press {submit} in {currentProvider} window' }
                  values={{
                    currentProvider: this.state.currentProvider,
                    submit: <span>&ldquo;Submit&rdquo;</span>,
                  }}
                />
              </Modal>
            }
            {this.state.step === this.STEP.PROCESSING &&
              <Modal backdrop="static" isOpen={true}>
                <div className="image-container">
                  <img src="images/spinner-animation.svg" role="presentation"/>
                </div>
                <FormattedMessage
                  id={ 'listing-create.uploadingYourListing' }
                  defaultMessage={ 'Uploading your listing' }
                />
                <br />
                <FormattedMessage
                  id={ 'listing-create.pleaseStandBy' }
                  defaultMessage={ 'Please stand by...' }
                />
              </Modal>
            }
            {this.state.step === this.STEP.SUCCESS &&
              <Modal backdrop="static" isOpen={true}>
                <div className="image-container">
                  <img src="images/circular-check-button.svg" role="presentation"/>
                </div>
                <FormattedMessage
                  id={ 'listing-create.successMessage' }
                  defaultMessage={ 'Success' }
                />
                <div className="button-container">
                  <Link to="/" className="btn btn-clear">
                    <FormattedMessage
                      id={ 'listing-create.seeAllListings' }
                      defaultMessage={ 'See All Listings' }
                    />
                  </Link>
                </div>
              </Modal>
            }
            {this.state.step === this.STEP.ERROR && (
              <Modal backdrop="static" isOpen={true}>
                <div className="image-container">
                  <img src="images/flat_cross_icon.svg" role="presentation" />
                </div>
                <FormattedMessage
                  id={ 'listing-create.error1' }
                  defaultMessage={ 'There was a problem creating this listing.' }
                />
                <br />
                <FormattedMessage
                  id={ 'listing-create.error2' }
                  defaultMessage={ 'See the console for more details.' }
                />
                <div className="button-container">
                  <a
                    className="btn btn-clear"
                    onClick={e => {
                      e.preventDefault()
                      this.resetToPreview()
                    }}
                  >
                    <FormattedMessage
                      id={ 'listing-create.OK' }
                      defaultMessage={ 'OK' }
                    />
                  </a>
                </div>
              </Modal>
            )}
            <div className="row">
              <div className="col-md-7">
                <label className="create-step">
                  <FormattedMessage
                    id={ 'listing-create.stepNumberLabel' }
                    defaultMessage={ 'STEP {stepNumber}' }
                    values={{ stepNumber: Number(this.state.step) }}
                  />
                </label>
                <h2>
                  <FormattedMessage
                    id={ 'listing-create.previewListingHeading' }
                    defaultMessage={ 'Preview your listing' }
                  />
                </h2>
              </div>
            </div>
            <div className="row flex-sm-row-reverse">
              <div className="col-md-5">
                <div className="info-box">
                  <div>
                    <h2>
                      <FormattedMessage
                        id={ 'listing-create.whatHappensNextHeading' }
                        defaultMessage={ 'What happens next?' }
                      />
                    </h2>
                    <FormattedMessage
                      id={ 'listing-create.whatHappensNextContent1' }
                      defaultMessage={ 'When you hit submit, a JSON object representing your listing will be published to {ipfsLink}  and the content hash will be published to a listing smart contract running on the Ethereum network.' }
                      values={{ 
                        ipfsLink: <a target="_blank" rel="noopener noreferrer" href="https://ipfs.io">
                          <FormattedMessage
                            id={ 'listing-create.IPFS' }
                            defaultMessage={ 'IPFS' }
                          />
                        </a> 
                      }}
                    />
                    <br/>
                    <br/>
                    <FormattedMessage
                      id={ 'listing-create.whatHappensNextContent2' }
                      defaultMessage={ 'Please review your listing before submitting. Your listing will appear to others just as it looks on the window to the left.' }
                    />
                  </div>
                </div>
              </div>
              <div className="col-md-7">
                <div className="preview">
                  <ListingDetail listingJson={this.state.formData} />
                </div>
                <div className="btn-container">
                  <button className="btn btn-other float-left" onClick={() => this.setState({step: this.STEP.DETAILS})}>
                    <FormattedMessage
                      id={ 'listing-create.backButtonLabel' }
                      defaultMessage={ 'Back' }
                    />
                  </button>
                  <button className="btn btn-primary float-right"
                    onClick={() => this.onSubmitListing(this.state.formData, this.state.selectedSchemaType)}>
                    <FormattedMessage
                      id={ 'listing-create.doneButtonLabel' }
                      defaultMessage={ 'Done' }
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        }
      </div>
    )
  }
}

const mapDispatchToProps = dispatch => ({
  showAlert: (msg) => dispatch(showAlert(msg))
})

export default connect(undefined, mapDispatchToProps)(injectIntl(ListingCreate))
