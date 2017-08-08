import React, { Component } from 'react'
import { render } from 'react-dom'

import Form from 'react-jsonschema-form'

// Delete this after writing error handling
const log = (type) => console.log.bind(console, type)

class SchemaForm extends Component {
  constructor(props) {
    super(props)

    this.handleSchemaSelection = this.handleSchemaSelection.bind(this)
  }

  handleSchemaSelection(formSchema, onSchemaSelection) {
    const selectedSchema = formSchema.formData.selectedSchema
    onSchemaSelection(selectedSchema)
  }

  render() {
    return (
      <Form 
        schema={this.props.schemaList}
        onChange={(formSchema) => {
          this.handleSchemaSelection(formSchema, this.props.onSchemaSelection)
        }}
        onError={log("errors")}/>
    );
  }
}

export default SchemaForm;
