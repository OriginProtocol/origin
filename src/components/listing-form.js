import React, { Component } from 'react'

import Form from 'react-jsonschema-form'

// Delete this after writing error handling
const log = (type) => console.log.bind(console, type)

class ListingForm extends Component {
  handleSubmitListing(formListing, selectedSchemaType, onSubmitListing) {
    const jsonBlob = {
      'schema': `http://localhost:3000/schemas/${selectedSchemaType.type}.json`,
      'data': formListing.formData,
      'signed_by': 'https://keybase.io/joshfraser',
      'signature': `-----BEGIN PGP SIGNATURE-----
Version: Keybase OpenPGP v2.0.73
Comment: https://keybase.io/crypto

wsBcBAABCgAGBQJZlhmAAAoJEKTjGE37cmbxy38IALSQxXAE4wVc8d4rP0v8TaBE
MolxVoyev2MXUz0wdclXS2mmKMSVObiFOqjrCxqBTvzQRYbquuSQUTzO4t/C1WPp
AEodUf7KSBH7fGnuYVixIRvrvtF2MMGlFm/U1MpY1CtY5G+UYhzdoLWvOGf5b1yw
BiTAwczR7KqtFOYYdmNuIIqsUvLlV6fQjCihItIgc2521iZYxNUBSBjhINEtCUvV
L6tE1lR1dMcKOa7JMTqQsbGloiD5t2IsEdzxbzgWlheTjcqoN6id+QzPC1DK9mjX
b7Qf9nchgZZhJdOBSoSRqf47nxdUx1bqY1DIR+hOyF+p6j2nYVMcDD5Z3uB/tns=
=A9r6
-----END PGP SIGNATURE-----`
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
