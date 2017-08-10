import React, { Component } from 'react'
import { render } from 'react-dom'

import ListingForm from './listing-form'

// Make this a relative URL
class Schema extends React.Component {
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

class DemoStep1 extends Component {
  constructor(props) {
    super(props)

    this.state = {
      selectedSchemaType: this.props.schemaList[0],
      selectedSchema: null,
      schemaFetched: false
    }

    this.handleSchemaSelection = this.handleSchemaSelection.bind(this)
    this.handleSchemaSelection(this.props.schemaList[0])
  }

  handleSchemaSelection(schemaType) {
    // Need to change this to a non local URL
    fetch('http://localhost:3000/schemas/' + schemaType.type + '.json')
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
        <h4>Choose a schema for your product or service</h4>
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
