import React, { Component } from 'react';
import { render } from 'react-dom';

import forSaleSchema from '../../public/schemas/for-sale.json'
import ListingForm from './listing-form'
import SchemaForm from './schema-form'
import schemaList from '../../public/schemas/list.json'

// Think about how we want to initialize default state
const DEFAULT_SCHEMA_TYPE = 'for-sale'
const DEFAULT_SCHEMA = forSaleSchema

class DemoStep1 extends Component {
  constructor(props) {
    super(props)

    this.state = {
      selectedSchemaType: DEFAULT_SCHEMA_TYPE,
      selectedSchema: DEFAULT_SCHEMA
    }

    this.handleSchemaSelection = this.handleSchemaSelection.bind(this)
  }

  handleSchemaSelection(schemaType) {
    // Need to change this to a non local URL
    const selectedSchema = fetch('http://localhost:3000/schemas/' + schemaType + '.json')
    .then((response) => response.json())
    .then((schemaJson) => {
      this.setState({
        selectedSchemaType: schemaType,
        selectedSchema: schemaJson
      })
    })
  }

  render() {
    return (
      <div className="step">
        <h2 className="step-title">Step 1</h2>
        <p className="step-content">
          Step 1 content goes here
        </p>
        <h1>1. Choose a schema for your listing</h1>
        <p>0rigin uses <a href='http://json-schema.org'>JSON schema</a> definitions to describe the required fields and validation rules for each type of listing. Developers can easily extend these schemas or create their own for specific verticals.</p>
        <SchemaForm 
          schemaList={schemaList} 
          onSchemaSelection={this.handleSchemaSelection} />

        <h1>2. Then fill it out</h1>

        <ListingForm 
          schema={this.state.selectedSchema} 
          onSubmitListing={this.props.onStep1Completion}/>
      </div>
    );
  }
}

export default DemoStep1;
