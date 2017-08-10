import React, { Component } from 'react'
import { render } from 'react-dom'

import Form from 'react-jsonschema-form'

// Delete this after writing error handling
const log = (type) => console.log.bind(console, type)

class ListingForm extends Component {
  handleSubmitListing(formListing, selectedSchemaType, onSubmitListing) {
    const jsonBlob = {
      'schema':'http://localhost:3000/schemas/' + selectedSchemaType.type + '.json', 
      'data':formListing.formData, 
      'signature':'QmbviCEZgU1ArYtEHW9JRntdLQd1RcJ4hLuNJ3PCxkk12A'
    }
    onSubmitListing(jsonBlob)
  }

  render() {
    return (
      <Form schema={this.props.schema}
        onSubmit={(formListing) => {
          this.handleSubmitListing(formListing, this.props.selectedSchemaType, this.props.onSubmitListing)
        }}
        onError={log("errors")}
      />
    );
  }
}

export default ListingForm
