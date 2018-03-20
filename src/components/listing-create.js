import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { contractService, originService } from '@originprotocol/origin'

import ListingDetail from './listing-detail'
import Form from 'react-jsonschema-form'
import Modal from './modal'

const alertify = require('../../node_modules/alertify/src/alertify.js')

class ListingCreate extends Component {

  constructor(props) {
    super(props)

    // This is non-ideal fix until IPFS can correctly return 443 errors
    // Server limit is 2MB, withg 100K safety buffer
    this.MAX_UPLOAD_BYTES = (2e6 - 1e5)

    // Enum of our states
    this.STEP = {
      PICK_SCHEMA: 1,
      DETAILS: 2,
      PREVIEW: 3,
      METAMASK: 4,
      PROCESSING: 5,
      SUCCESS: 6
    }

    this.schemaList = [
      {type: 'for-sale', name: 'For Sale', 'img': 'for-sale.jpg'},
      {type: 'housing', name: 'Housing', 'img': 'housing.jpg'},
      {type: 'transportation', name: 'Transportation', 'img': 'transportation.jpg'},
      {type: 'tickets', name: 'Tickets', 'img': 'tickets.jpg'},
      {type: 'services', name: 'Services', 'img': 'services.jpg'},
      {type: 'announcements', name: 'Announcements', 'img': 'announcements.jpg'},
    ]

    this.state = {
      step: this.STEP.PICK_SCHEMA,
      selectedSchemaType: this.schemaList[0],
      selectedSchema: null,
      schemaFetched: false,
      formListing: {formData: null}
    }

    this.handleSchemaSelection = this.handleSchemaSelection.bind(this)
    this.onDetailsEntered = this.onDetailsEntered.bind(this)
  }

  handleSchemaSelection() {
    fetch(`/schemas/${this.state.selectedSchemaType}.json`)
    .then((response) => response.json())
    .then((schemaJson) => {
      this.setState({
        selectedSchema: schemaJson,
        schemaFetched: true,
        step: this.STEP.DETAILS
      })
      window.scrollTo(0, 0)
    })
  }

  onDetailsEntered(formListing) {
    // Helper function to approximate size of object in bytes
    function roughSizeOfObject( object ) {
      var objectList = []
      var stack = [object]
      var bytes = 0
      while (stack.length) {
        var value = stack.pop()
        if (typeof value === 'boolean') {
          bytes += 4
        } else if (typeof value === 'string') {
          bytes += value.length * 2
        } else if (typeof value === 'number') {
          bytes += 8
        }
        else if (typeof value === 'object'
          && objectList.indexOf(value) === -1)
        {
          objectList.push(value)
          for (var i in value) {
            if (value.hasOwnProperty(i)) {
              stack.push(value[i])
            }
          }
        }
      }
      return bytes
    }
    if (roughSizeOfObject(formListing.formData) > this.MAX_UPLOAD_BYTES) {
      alertify.log("Your listing is too large. Consider using fewer or smaller photos.")
    } else {
      this.setState({
        formListing: formListing,
        step: this.STEP.PREVIEW
      })
      window.scrollTo(0, 0)
    }
  }

  onSubmitListing(formListing, selectedSchemaType) {
    this.setState({ step: this.STEP.METAMASK })
    originService.submitListing(formListing, selectedSchemaType)
    .then((tx) => {
      this.setState({ step: this.STEP.PROCESSING })
      // Submitted to blockchain, now wait for confirmation
      return contractService.waitTransactionFinished(tx)
    })
    .then((blockNumber) => {
      this.setState({ step: this.STEP.SUCCESS })
      // TODO: Where do we take them after successful creation?
    })
    .catch((error) => {
      console.error(error)
      alertify.log(error.message)
      // TODO: Reset form? Do something.
    })
  }

  render() {
    return (
      <div className="container listing-form">
        { this.state.step === this.STEP.PICK_SCHEMA &&
          <div className="step-container pick-schema">
            <div className="row flex-sm-row-reverse">
             <div className="col-md-5 offset-md-2">
                <div className="info-box">
                  <h2>Choose a schema for your product or service</h2>
                  <p>Your product or service will use a schema to describe its attributes like name, description, and price. Origin already has multiple schemas that map to well-known categories of listings like housing, auto, and services.</p>
                  <div className="info-box-image"><img className="d-none d-md-block" src="/images/features-graphic.svg" role="presentation" /></div>
                </div>
              </div>

              <div className="col-md-5">
                <label>STEP {Number(this.state.step)}</label>
                <h2>What type of listing do you want to create?</h2>
                <div className="schema-options">
                  {this.schemaList.map(schema => (
                    <div
                      className={
                        this.state.selectedSchemaType === schema.type ?
                        'schema-selection selected' : 'schema-selection'
                      }
                      key={schema.type}
                      onClick={() => this.setState({selectedSchemaType:schema.type})}
                    >
                      {schema.name}
                    </div>
                  ))}
                </div>
                <div className="btn-container">
                  <button className="float-right btn btn-primary" onClick={() => this.handleSchemaSelection()}>
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        }
        { this.state.step === this.STEP.DETAILS &&
          <div className="step-container schema-details">
            <div className="row flex-sm-row-reverse">
               <div className="col-md-5 offset-md-2">
                  <div className="info-box">
                    <div><h2>How it works</h2>Origin uses a Mozilla project called <a href="http://json-schema.org/" target="_blank">JSONSchema</a> to validate your listing according to standard rules. This standardization is key to allowing unaffiliated entities to read and write to the same data layer.<br/><br/>Be sure to give your listing an appropriate title and description that will inform others as to what you’re offering.<br/><br/><a href={`/schemas/${this.state.selectedSchemaType}.json`} target="_blank">View the <code>{this.state.selectedSchema.name}</code> schema</a></div>
                    <div className="info-box-image"><img className="d-none d-md-block" src="/images/features-graphic.svg" role="presentation" /></div>
                  </div>
                </div>
              <div className="col-md-5">
                <label>STEP {Number(this.state.step)}</label>
                <h2>Create your listing</h2>
                <Form
                  schema={this.state.selectedSchema}
                  onSubmit={this.onDetailsEntered}
                  formData={this.state.formListing.formData}
                  onError={(errors) => console.log(`react-jsonschema-form errors: ${errors.length}`)}
                >
                  <div className="btn-container">
                    <button type="button" className="btn btn-other" onClick={() => this.setState({step: this.STEP.PICK_SCHEMA})}>
                      Back
                    </button>
                    <button type="submit" className="float-right btn btn-primary">Continue</button>
                  </div>
                </Form>

              </div>
              <div className="col-md-6">
              </div>
            </div>
          </div>
        }
        { (this.state.step >= this.STEP.PREVIEW) &&
          <div className="step-container listing-preview">
            {this.state.step === this.STEP.METAMASK &&
              <Modal backdrop="static" isOpen={true}>
                <div className="image-container">
                  <img src="/images/spinner-animation.svg" role="presentation"/>
                </div>
                Confirm transaction<br />
                Press &ldquo;Submit&rdquo; in MetaMask window
              </Modal>
            }
            {this.state.step === this.STEP.PROCESSING &&
              <Modal backdrop="static" isOpen={true}>
                <div className="image-container">
                  <img src="/images/spinner-animation.svg" role="presentation"/>
                </div>
                Uploading your listing<br />
                Please stand by...
              </Modal>
            }
            {this.state.step === this.STEP.SUCCESS &&
              <Modal backdrop="static" isOpen={true}>
                <div className="image-container">
                  <img src="/images/circular-check-button.svg" role="presentation"/>
                </div>
                Success<br />
                <Link to="/">See All Listings</Link>
              </Modal>
            }
            <div className="row">
              <div className="col-md-7">
                <label className="create-step">STEP {Number(this.state.step)}</label>
                <h2>Preview your listing</h2>
              </div>
            </div>
            <div className="row flex-sm-row-reverse">
              <div className="col-md-5">
                <div className="info-box">
                  <div><h2>What happens next?</h2>When you hit submit, a JSON object representing your listing will be published to <a target="_blank" href="https://ipfs.io">IPFS</a> and the content hash will be published to a listing smart contract running on the Ethereum network.<br/><br/>Please review your listing before submitting. Your listing will appear to others just as it looks on the window to the left.</div>
                </div>
              </div>
              <div className="col-md-7">
                <div className="preview">
                  <ListingDetail listingJson={this.state.formListing.formData} />
                </div>
                <div className="btn-container">
                  <button className="btn btn-other float-left" onClick={() => this.setState({step: this.STEP.DETAILS})}>
                    Back
                  </button>
                  <button className="btn btn-primary float-right"
                    onClick={() => this.onSubmitListing(this.state.formListing, this.state.selectedSchemaType)}>
                    Done
                  </button>
                </div>
              </div>
            </div>
          </div>
        }
      </div>
    )
  }
}

export default ListingCreate
