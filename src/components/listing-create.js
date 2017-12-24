import React, { Component } from 'react'

import ListingForm from './listing-form'

// Make this a relative URL
class Schema extends React.Component {
  render() {
    return (
      <div className="schema-option">
        <div className="img-wrapper">
          <img src={'/' + this.props.schema.img}
            onClick={() => this.props.onSelection()}
            alt={this.props.schema.name}
            />
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


class ListingCreate extends Component {

  constructor(props) {
    super(props)

    this.schemaList = [
      {type: 'for-sale', name: 'For Sale', 'img': 'for-sale.jpg'},
      {type: 'housing', name: 'Housing', 'img': 'housing.jpg'},
      {type: 'transportation', name: 'Transportation', 'img': 'transportation.jpg'},
      {type: 'tickets', name: 'Tickets', 'img': 'tickets.jpg'},
      {type: 'services', name: 'Services', 'img': 'services.jpg'},
      {type: 'announcements', name: 'Announcements', 'img': 'announcements.jpg'},
    ]

    this.state = {
      selectedSchemaType: this.schemaList[0],
      selectedSchema: null,
      schemaFetched: false
    }

    this.handleSchemaSelection = this.handleSchemaSelection.bind(this)
    this.handleSchemaSelection(this.schemaList[0])

    this.handleFormSumbit = this.handleFormSumbit.bind(this)
  }

  handleSchemaSelection(schemaType) {
    // Need to change this to a non local URL
    fetch('/schemas/' + schemaType.type + '.json')
    .then((response) => response.json())
    .then((schemaJson) => {
      this.setState({
        selectedSchemaType: schemaType,
        selectedSchema: schemaJson,
        schemaFetched: true
      })
    })
  }

  handleFormSumbit(formListing, selectedSchemaType) {
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

    console.log("Submitting:")
    console.log(jsonBlob)
    // // Submit to IPFS
    // ipfsService.submitListing(listingData)
    // .then((ipfsHash) => {
    //   onSubmitToIpfs(ipfsHash)
    // })
    // .catch((error) => {
    //   alert(error)
    // });
  }

  render() {
    console.log("Rendering ListingCreate")

    return (
      <section className="step">
        <SchemaOptions
          schemaList={this.schemaList}
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
                onSubmitListing={this.handleFormSumbit}/>
            }
          </div>
          <div className="col-md-6">
          </div>
        </div>
      </section>
    );
  }
}

export default ListingCreate
