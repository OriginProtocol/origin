import React, { Component } from 'react';
import { render } from 'react-dom';

import Form from 'react-jsonschema-form';

import contractService from './contract-service';
import ipfsService from './ipfs-service';

// Delete this after writing error handling
const log = (type) => console.log.bind(console, type);

class SchemaForm extends Component {
  constructor(props) {
    super(props);
    this.handleSchemaSelection = this.handleSchemaSelection.bind(this);
  }

  handleSchemaSelection(formSchema, onSchemaSelection) {
    let selectedSchema = formSchema.formData.selectedSchema;
    onSchemaSelection(selectedSchema);
  }

  render() {
    return (
      <div className="pure-g">
        <div className="pure-u-1-1">
          <Form 
            schema={this.props.schemaList}
            onChange={(formSchema) => {
              this.handleSchemaSelection(formSchema, this.props.onSchemaSelection)
            }}
            onError={log("errors")}/>
        </div>
      </div>
    );
  }
}

export default SchemaForm;
