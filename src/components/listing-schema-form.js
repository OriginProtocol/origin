import React, { Component } from 'react'

import Form from 'react-jsonschema-form'

// Delete this after writing error handling
const log = (type) => console.log.bind(console, type)

class ListingSchemaForm extends Component {
  render() {
    return (
      <Form schema={this.props.schema}
        onSubmit={(formListing) => {
          this.props.onDetailsEntered(formListing)
        }}
        onError={log("errors")}
      />
    );
  }
}

export default ListingSchemaForm
