import React, { Component } from 'react';
import { render } from 'react-dom';

import Form from 'react-jsonschema-form';

import contractService from './contract-service';
import ipfsService from './ipfs-service';

// Delete this after writing error handling
const log = (type) => console.log.bind(console, type);

class ListingForm extends Component {

  submitListing(formListing) {
    ipfsService.submitListing(formListing)
      .then((ipfsListing) => {contractService.submitListing(ipfsListing)});
  }

  render() {
    return (
      <div className="pure-g">
        <div className="pure-u-1-1">
          <Form schema={this.props.schema}
            onChange={this.props.onChange}
            onSubmit={(formListing) => this.submitListing(formListing)}
            onError={log("errors")}/>
        </div>
      </div>
    );
  }
}

export default ListingForm;
