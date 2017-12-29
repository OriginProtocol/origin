import React, { Component } from 'react'
import originService from '../services/origin-service'

import ListingSchemaForm from './listing-schema-form'

class ListingForm extends Component {

  constructor(props) {
    super(props)

    // TODO: js enum thing for state
    this.STEP = {PICK_SCHEMA: 1, DETAILS: 2, PREVIEW: 3, SUBMITTED: 4}

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
    this.handleFormSubmit = this.handleFormSubmit.bind(this)
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
      window.scrollTo(0, 0)
    })
  //   this.setState({
  //     selectedSchema: this.state.selectedSchemaType,
  //     selectedSchema: "",
  //     schemaFetched: true,
  //     step: this.STEP.DETAILS
  //   })
  }

  handleFormSubmit(formListing, selectedSchemaType) {
    debugger
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
    return (
      <div className="container listing-form">
        <div> Step:{Number(this.state.step)} </div>
        { this.state.step === this.STEP.PICK_SCHEMA &&
          <div className="schema-options">
            <div className="row">
              <div className="col-md-5">
                <h1>Let's get started creating your listing</h1>
              </div>

              <div className="col-md-6"></div>

              <div className="col-md-5">
                <label>STEP 1</label>
                <h2>What type of listing do you want to create?</h2>

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
                    Next
                  </button>
              </div>

              <div className="col-md-2"></div>
              <div className="col-md-5"></div>

            </div>
          </div>
        }
        { this.state.step === this.STEP.DETAILS &&
          <div className="row">
            <div className="col-md-12">
              <h4>
                {this.state.selectedSchemaType.name}
              </h4>
              <ListingSchemaForm
                schema={this.state.selectedSchema}
                selectedSchemaType={this.state.selectedSchemaType}
                onSubmitListing={this.handleFormSubmit}/>
            </div>
            <div className="col-md-6">
            </div>
          </div>
        }
        {this.state.listingSubmitted &&
          <div className="listing-submitted-notification">
            Creating Listing
          </div>
        }
      </div>
    );
  }
}

export default ListingForm
