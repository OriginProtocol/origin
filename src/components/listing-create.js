import React, { Component } from 'react'
import originService from '../services/origin-service'

import ListingForm from './listing-form'

class Schema extends React.Component {
  render() {
    return (
      <div className="schema-option">
        <div className="img-wrapper">
          <img src={'/' + this.props.schema.img}
            onClick={() => this.props.onSelection()}
            alt={this.props.schema.name}
            />
        </div>
        <h4 onClick={() => this.props.onSelection()}>
          {this.props.schema.name}
        </h4>
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
          {this.props.schemaList.map((schema) => {
            return (
              <div className="col-md-4" key={schema.type}>
                {this.renderSchema(schema)}
              </div>
            )
          })}
        </div>
      </div>
    );
  }
}


class ListingCreate extends Component {

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
        schemaFetched: true
      })
    })
  }

  handleFormSubmit(formListing, selectedSchemaType) {

    originService.submitListing(formListing, selectedSchemaType)
    .then((transactionReceipt) => {
      alert("On IPFS and sent to contract")
      // TODO: how do we want to flip to new "page" to wait for result?
    })
    .catch((error) => {
      console.error(error)
        alert(error)
        // TODO: Reset form? Do something.
    });

  }

  render() {
    console.log("Rendering ListingCreate")

    return (
      <div>
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
              <ListingForm
                schema={this.state.selectedSchema}
                selectedSchemaType={this.state.selectedSchemaType}
                onSubmitListing={this.handleFormSubmit}/>
            }
          </div>
          <div className="col-md-6">
          </div>
        </div>
      </div>
    );
  }
}

export default ListingCreate
