import React, { Component } from 'react'
import { render } from 'react-dom'

import Form from 'react-jsonschema-form'

// Delete this after writing error handling
const log = (type) => console.log.bind(console, type)

class ListingForm extends Component {
  handleSubmitListing(formListing, onSubmitListing) {
    onSubmitListing(formListing.formData)
  }

  render() {
    return (
      <Form schema={this.props.schema}
        onSubmit={(formListing) => {
          this.handleSubmitListing(formListing, this.props.onSubmitListing)
        }}
        onError={log("errors")}
      />
    );
  }
}

export default ListingForm
