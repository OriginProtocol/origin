import React, { Component } from 'react';
import { render } from 'react-dom';

import Form from 'react-jsonschema-form';

import contractService from './contract-service';
import ipfsService from './ipfs-service';

// Delete this after writing error handling
const log = (type) => console.log.bind(console, type);

class SchemaForm extends Component {

  updateForm(formListing, handler) {

    console.log(formListing)

    let selectedSchema = formListing.formData.selectedSchema
    console.log(selectedSchema)
    handler(selectedSchema)
    console.log('Fuck')
    console.log(selectedSchema)
    formListing.formData.selectedSchema = selectedSchema
    console.log(formListing.formData.selectedSchema)
    return formListing.formData.selectedSchema
    // let defaultForm = fetch('/schemas/'+selectedSchema)   
    //   // we got it!
    //   console.log(result)
    // });
    // ipfsService.submitListing(formListing)
    //   .then((ipfsListing) => {contractService.submitListing(ipfsListing)});
  }

  render() {
    return (
      <div className="pure-g">
        <div className="pure-u-1-1">
          <Form schema={this.props.schema}
            onChange={(formListing) => {
              this.updateForm(formListing, this.props.handler)}}
            onError={log("errors")}/>
        </div>
      </div>
    );
  }
}

export default SchemaForm;
