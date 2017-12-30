import React, { Component } from 'react'
import originService from '../services/origin-service'
import contractService from '../services/contract-service'

import ListingSchemaForm from './listing-schema-form'
import ListingDetail from './listing-detail'

class ListingCreate extends Component {

  constructor(props) {
    super(props)

    // Enum of our states
    this.STEP = {
      PICK_SCHEMA: 1,
      DETAILS: 2,
      PREVIEW: 3,
      PROCESSING: 4,
      SUCCESS: 5
    }

    this.schemaList = [
      {type: 'for-sale', name: 'For Sale', 'img': 'for-sale.jpg'},
      {type: 'housing', name: 'Housing', 'img': 'housing.jpg'},
      {type: 'transportation', name: 'Transportation', 'img': 'transportation.jpg'},
      {type: 'tickets', name: 'Tickets', 'img': 'tickets.jpg'},
      {type: 'services', name: 'Services', 'img': 'services.jpg'},
      {type: 'announcements', name: 'Announcements', 'img': 'announcements.jpg'},
    ]

    this.state = {
      step: this.STEP.PICK_SCHEMA,
      selectedSchemaType: this.schemaList[0],
      selectedSchema: null,
      schemaFetched: false,
    }

    this.handleSchemaSelection = this.handleSchemaSelection.bind(this)
    this.onDetailsEntered = this.onDetailsEntered.bind(this)
  }

  prevStep() {

  }

  handleSchemaSelection() {
    fetch(`/schemas/${this.state.selectedSchemaType}.json`)
    .then((response) => response.json())
    .then((schemaJson) => {
      this.setState({
        selectedSchema: schemaJson,
        schemaFetched: true,
        step: this.STEP.DETAILS
      })
    })
  }

  onDetailsEntered(formListing) {
    this.setState({
      formListing: formListing,
      step: this.STEP.PREVIEW
    })
  }

  onSubmitListing(formListing, selectedSchemaType) {
    this.setState({
      step: this.STEP.PROCESSING
    })
    originService.submitListing(formListing, selectedSchemaType)
    .then((tx) => {
      // Submitted to blockchain, now wait for confirmation
      contractService.waitTransactionFinished(tx)
      .then((blockNumber) => {
        this.setState({
          step: this.STEP.SUCCESS
        })
        // TODO: Where do we take them after successful creation?
      })
      .catch((error) => {
        console.error(error)
        alert(error)
        // TODO: Reset form? Do something.
      })
    })
    .catch((error) => {
      console.error(error)
      alert(error)
      // TODO: Reset form? Do something.
    });
  }

  render() {
    window.scrollTo(0, 0)
    return (
      <div className="container listing-form">
        { this.state.step === this.STEP.PICK_SCHEMA &&
          <div className="pick-schema">
            <div className="row schema-options">
              <div className="col-md-5">
                <h1>Let's get started creating your listing</h1>
              </div>
            </div>
            <div className="row flex-sm-row-reverse">
             <div className="col-md-5 offset-md-2">
                <div className="info-box">
                  <h2>Choose a schema for your product or service</h2>
                  <p>Your product or service will use a schema to describe its attributes like name, description, and price. Here are a few simplified schemas that map to well-known categories of listings like housing, auto, and services.</p>
                  <div className="info-box-image"><img className="d-none d-md-block" src="/images/features-graphic.png" /></div>
                </div>
              </div>

              <div className="col-md-5">

                <label>STEP {Number(this.state.step)}</label>
                <h2>What Type of listing do you want to create?</h2>
                  {this.schemaList.map(x => (
                    <div className="schema-selection radio" key={x.type} >
                      <label>
                        <input
                          type="radio"
                          value={x.type}
                          checked={this.state.selectedSchemaType === x.type}
                          onChange={() => this.setState({selectedSchemaType:x.type})}
                        /> {x.name}
                      </label>
                    </div>
                  ))}
                  <button className="float-right btn btn-primary" onClick={() => this.handleSchemaSelection()}>
                    Next
                  </button>
              </div>

            </div>
          </div>
        }
        { this.state.step === this.STEP.DETAILS &&
          <div className="schema-details">
            <div className="row flex-sm-row-reverse">
               <div className="col-md-5 offset-md-2">
                  <div className="info-box">
                    <p><h2>How it works</h2>Origin uses a Mozilla project called <a href="http://json-schema.org/">JSONSchema</a> to validate your listing according to standard rules. This standardization is key to allowing unaffiliated entities to read and write to the same data layer.<br/><br/>Be sure to give your listing an appropriate title and description that will inform others as to what you’re offering.<br/><br/><a href={`/schemas/${this.state.selectedSchemaType}.json`}>View the <code>{this.state.selectedSchema.name}</code> schema</a></p>
                    <div className="info-box-image"><img className="d-none d-md-block" src="/images/features-graphic.png" /></div>
                  </div>
                </div>


              <div className="col-md-5">
                <label>STEP {Number(this.state.step)}</label>
                <h2>Create your listing</h2>
                {this.state.selectedSchemaType.name}
                <ListingSchemaForm
                  schema={this.state.selectedSchema}
                  selectedSchemaType={this.state.selectedSchemaType}
                  onDetailsEntered={this.onDetailsEntered}
                  formData={this.state.formListing ? this.state.formListing.formData : null}
                />
                <button className="hollow float-left" onClick={() => this.setState({step: this.STEP.PICK_SCHEMA})}>
                  Back
                </button>
              </div>
              <div className="col-md-6">
              </div>
            </div>
          </div>
        }
        { this.state.step === this.STEP.PREVIEW &&
  
          <div className="listing-preview">
            <div className="row">
              <div className="col-md-7">
                <label className="create-step">STEP {Number(this.state.step)}</label>
                <h2>Preview your listing</h2>
              </div>
            </div>
            <div className="row flex-sm-row-reverse">
              <div className="col-md-5">
                <div className="info-box">
                  <p><h2>What happens next?</h2>When you hit submit, a JSON object representing your listing will be published to <a href="https://ipfs.io">IPFS</a> and the content hash will be published to a listing smart contract running on the Ethereum network.<br/><br/>Please review your listing before submitting. Your listing will appear to others just as it looks on the window to the left.</p>
                </div>
              </div>

              <div className="col-md-7">
                <div className="preview">
                  <ListingDetail listingJson={this.state.formListing.formData} />
                </div>
                <div>
                  <button className="hollow float-left" onClick={() => this.setState({step: this.STEP.DETAILS})}>
                    Back
                  </button>
                  <button className="float-right"
                    onClick={() => this.onSubmitListing(this.state.formListing, this.state.selectedSchemaType)}>
                    Done
                  </button>
                </div>
              </div>
            </div>
          </div>
        }
        { this.state.step === this.STEP.PROCESSING &&
          <div className="row">
            <div className="col-md-5 listing-wait-confirmation">
              <h1>Processing...</h1>
              <div><img src="images/ajax-loader.gif" role="presentation"/></div>
            </div>
            <div className="col-md-6">
            </div>
          </div>
        }
        {this.state.step === this.STEP.SUCCESS &&
          <div className="row">
            <div className="col-md-5">
              <label>&nbsp;</label>
              <h2>Success</h2>
            </div>
            <div className="col-md-6">
            </div>
          </div>
        }
      </div>
    );
  }
}

export default ListingCreate
