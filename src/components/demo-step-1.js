import React, { Component } from 'react'
import { render } from 'react-dom'

import forSaleSchema from '../../public/schemas/for-sale.json'
import ListingForm from './listing-form'
import SchemaForm from './schema-form'
import schemaList from '../../public/schemas/list.json'

// Make this a relative URL
class SchemaOption extends React.Component {
  render() {
    return (
      <div className="schema-option">
        <div className="img-wrapper">
          <img src={'http://localhost:3000/' + this.props.schema.img}
            onClick={() => this.props.onSelection()}/>
        </div>
        <h4 onClick={() => this.props.onSelection()}>
          {this.props.schema.name}
        </h4>
      </div>
    )
  }
}

class SchemaOptions extends React.Component {
  renderSchema(i) {
    return (
      <SchemaOption 
        schema={this.props.schemaList[i]} 
        onSelection={() => this.props.onSchemaSelection(this.props.schemaList[i].type)}
      />
    );
  }

  render() {
    return (
      <div className="row">
        <div className="col-md-4">
          {this.renderSchema(0)}
        </div>
        <div className="col-md-4">
          {this.renderSchema(1)}
        </div>
        <div className="col-md-4">
          {this.renderSchema(2)}
        </div>
      </div>
    );
  }
}

class DemoStep1 extends Component {
  constructor(props) {
    super(props)

    this.state = {
      selectedSchemaType: this.props.schemaList[0].type,
      selectedSchema: null,
      schemaFetched: false
    }

    this.handleSchemaSelection = this.handleSchemaSelection.bind(this)
    this.handleSchemaSelection(this.props.schemaList[0].type)
  }

  handleSchemaSelection(schemaType) {
    // Need to change this to a non local URL
    fetch('http://localhost:3000/schemas/' + schemaType + '.json')
    .then((response) => response.json())
    .then((schemaJson) => {
      this.setState({
        selectedSchemaType: schemaType,
        selectedSchema: schemaJson,
        schemaFetched: true
      })
    })
  }

  render() {
    return (
      <section className="step">
        <h3>Create your first decentralized listing on 0rigin</h3>
        <h4>1. Choose a schema for your product or service</h4>
        <p>
          Your product or service will use a schema to describe its 
          attributes like name, description, and price. 0rigin already 
          has multiple schemas that map to well-known 
          categories of listings like housing, auto, and services.
        </p>
        <p>
          These are <a href="http://json-schema.org" target="_blank">
          JSON schema</a> definitions that describe the required fields 
          and validation rules for each type of listing. If your listing 
          type is unsupported, you can easily extend our schemas or 
          create your own.
        </p>
        <SchemaOptions
          schemaList={this.props.schemaList} 
          onSchemaSelection={this.handleSchemaSelection} />
        <hr>
        </hr>
        <div className="row">
          <div className="col-md-6">
            {this.state.schemaFetched &&
              <ListingForm 
                schema={this.state.selectedSchema} 
                onSubmitListing={this.props.onStep1Completion}/>
            }
          </div>
          <div className="col-md-6">
          </div>
        </div>
      </section>
    );
  }
}

export default DemoStep1
