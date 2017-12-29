import React, { Component } from 'react'
import originService from '../services/origin-service'

import ListingSchemaForm from './listing-schema-form'
import ListingDetail from './listing-detail'
import Form from 'react-jsonschema-form'

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
    originService.submitListing(formListing, selectedSchemaType)
    .then((transactionReceipt) => {
      // Success
      this.props.onListingSubmitted(transactionReceipt, formListing)
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
          <div className="schema-options">
            <div className="row">

              <div className="col-md-5">
                <h1>Let's get started creating your listing</h1>
                <label>STEP {Number(this.state.step)}</label>
                <h2>What Type of listing do you want to create?</h2>
                  {this.schemaList.map(x => (
                    <div className="radio" key={x.type} >
                      <label>
                        <input
                          type="radio"
                          value={x.type}
                          checked={this.state.selectedSchemaType === x.type}
                          onChange={() => this.setState({selectedSchemaType:x.type})}
                        />
                          {x.name}
                      </label>
                    </div>
                  ))}
                  <button onClick={() => this.handleSchemaSelection()}>
                    Continue
                  </button>
              </div>

              <div className="col-md-6">
                Graphic here
                {/* graphic will go here*/}
              </div>

              <div className="col-md-2"></div>
              <div className="col-md-5"></div>

            </div>
          </div>
        }
        { this.state.step === this.STEP.DETAILS &&
          <div className="row">
            <div className="col-md-5">
              <label>STEP {Number(this.state.step)}</label>
              <h2>Create your listing</h2>
              {this.state.selectedSchemaType.name}
              <ListingSchemaForm
                schema={this.state.selectedSchema}
                selectedSchemaType={this.state.selectedSchemaType}
                onDetailsEntered={this.onDetailsEntered}
              />
              <button className="hollow" onClick={() => this.setState({step: this.STEP.PICK_SCHEMA})}>
                Back
              </button>
            </div>
            <div className="col-md-6">
            </div>
          </div>
        }
        { this.state.step === this.STEP.PREVIEW &&
          <div className="row">
            <div className="col-md-5">
              <label className="create-step">STEP {Number(this.state.step)}</label>
              <h2>Preview your listing</h2>
              <div className="preview">
                <ListingDetail listingJson={this.state.formListing.formData} />
              </div>
              <div>
                <button className="hollow" onClick={() => this.setState({step: this.STEP.DETAILS})}>
                  Back
                </button>
                <button
                  onClick={() => this.onSubmitListing(this.state.formListing, this.state.selectedSchemaType)}>
                  Done
                </button>
              </div>
            </div>
          </div>
        }
        { this.state.step === this.STEP.PROCESSING &&
          <div className="row">
            <div className="col-md-5">
              <label>&nbsp;</label>
              <h2>Processing</h2>
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
