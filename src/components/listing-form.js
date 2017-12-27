import React, { Component } from 'react'
import originService from '../services/origin-service'

import ListingSchemaForm from './listing-schema-form'

class Schema extends React.Component {
  render() {
    return (
      <div className="schema-option">
        <h3 className="listing-selection" onClick={() => this.props.onSelection()}>
          {this.props.schema.name}
        </h3>
      </div>
    )
  }
}


class SchemaOptions extends React.Component {
  renderSchema(schema) {
    return (
      <Schema
        schema={schema}
        onSelection={() => this.props.onSchemaSelection(schema)}
      />
    )
  }

  render() {
    return (
      <div className="schema-options">
        <div className="row">
          <div className="col-md-5">
            <h1>Let's get started creating your listing</h1>
          </div>
          <div className="col-md-6"></div>
          <div className="col-md-5">
          <label>STEP 1</label>
          <h2>What type of listing do you want to create?</h2>
            {this.props.schemaList.map((schema) => {
              return (
                <div key={schema.type}>
                  {this.renderSchema(schema)}
                </div>
              )
            })}
          </div>
          <div className="col-md-2"></div>
          <div className="col-md-5">
          </div>
        </div>
      </div>
    );
  }
}


class ListingForm extends Component {

  constructor(props) {
    super(props)

    this.schemaList = [
      {type: 'for-sale', name: 'For Sale', 'img': 'for-sale.jpg'},
      {type: 'housing', name: 'Housing', 'img': 'housing.jpg'},
      {type: 'transportation', name: 'Transportation', 'img': 'transportation.jpg'},
      {type: 'tickets', name: 'Tickets', 'img': 'tickets.jpg'},
      {type: 'services', name: 'Services', 'img': 'services.jpg'},
      {type: 'announcements', name: 'Announcements', 'img': 'announcements.jpg'},
    ]

    this.state = {
      selectedSchemaType: this.schemaList[0],
      selectedSchema: null,
      schemaFetched: false,

    }

    this.handleSchemaSelection = this.handleSchemaSelection.bind(this)
    this.handleSchemaSelection(this.schemaList[0])

    this.handleFormSubmit = this.handleFormSubmit.bind(this)
  }

  handleSchemaSelection(schemaType) {
    fetch('/schemas/' + schemaType.type + '.json')
    .then((response) => response.json())
    .then((schemaJson) => {
      this.setState({
        selectedSchemaType: schemaType,
        selectedSchema: schemaJson,
        schemaFetched: true,
        listingSubmitted: false
      })
    })
  }

  handleFormSubmit(formListing, selectedSchemaType) {
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
      <div className="container">
        <SchemaOptions
          schemaList={this.schemaList}
          onSchemaSelection={this.handleSchemaSelection} />
        <hr>
        </hr>
        <div className="row">
          <div className="col-md-12">
            {this.state.schemaFetched &&
              <h4>
                {this.state.selectedSchemaType.name}
              </h4>
            }
            {this.state.schemaFetched &&
              <ListingSchemaForm
                schema={this.state.selectedSchema}
                selectedSchemaType={this.state.selectedSchemaType}
                onSubmitListing={this.handleFormSubmit}/>
            }
          </div>
          <div className="col-md-6">
          </div>
        </div>
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
