import React, { Component } from 'react'

import Form from 'react-jsonschema-form'

// TODO: Delete this after writing error handling
const log = (type) => console.log.bind(console, type)


// TODO: Learn how to populate with existing values
// TODO: Learn how change name of submit button, and add back button
class ListingSchemaForm extends Component {
  render() {
    return (
      <Form schema={this.props.schema}
        onSubmit={(formListing) => {
          this.props.onDetailsEntered(formListing)
        }}
        formData={this.props.formData}
        onError={log("errors")}
      >
        <div>
          <button type="submit">Submit</button>
          <button type="button">Cancel</button>
        </div>
      </Form>

    );
  }
}

export default ListingSchemaForm
