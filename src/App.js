import React, { Component } from 'react'

import SchemaForm from './schema-form'
import ListingForm from './listing-form'

const log = (type) => console.log.bind(console, type);

import './App.css'
import './css/open-sans.css'
import './css/oswald.css'
import './css/pure-min.css'

import listOfSchemas from '../public/schemas/list.json'
let defaultSchemaType = 'for-sale'
import defaultSchema from '../public/schemas/for-sale.json'

class App extends Component {

  constructor(props) {
    super(props)

    this.state = {
      selectedSchemaType: defaultSchemaType,
      selectedSchema: defaultSchema
    }

    this.handler = this.handler.bind(this)
  }

  handler(schemaType) {
    let selectedSchema = fetch('http://localhost:3000/schemas/'+schemaType+'.json')
    .then((response) => response.json())
    .then((responseJson) => {
      this.setState({
        selectedSchemaType: schemaType,
        selectedSchema: responseJson
      })
    })
  }

  displaySchema(schemaType) {
    let selectedSchema = fetch('http://localhost:3000/schemas/'+schemaType+'.json')
    .then((response) => response.json())
    .then((responseJson) => {
      this.setState({
        selectedSchemaType: schemaType,
        selectedSchema: responseJson
      })
    })
  }

  render() {
    return (
      <div className="App">
        <nav className="navbar pure-menu pure-menu-horizontal">
            <a href="#" className="pure-menu-heading pure-menu-link">Origin Demo</a>
        </nav>
        <main className="container">
          <div className="row">
            <div className="col-md-offset-2 col-md-8">
              <div className="pure-g">
                <div className="pure-u-1-1">

                <h1>1. Choose a schema for your listing</h1>
                <p>0rigin uses <a href='http://json-schema.org'>JSON schema</a> definitions to describe the required fields and validation rules for each type of listing. Developers can easily extend these schemas or create their own for specific verticals.</p>
                <SchemaForm schema={listOfSchemas} handler={this.handler} />

                <h1>2. Then fill it out</h1>

                <ListingForm schema={this.state.selectedSchema} />

                <h1>3. Connect your identity (optional)</h1>
                <p>While it's okay if you want to stay anonymous, you can improve the trust-worthiness of your listing by cryptographically verifying your identity using <a href='http://www.keybase.io'>KeyBase</a>.  KeyBase allows you to connect your website or services like Facebook, Twitter, Github and Hacker News to provide publicly auditable proofs of your identity alongside your listing.</p>
                Have a Keybase account?  Sign this blob of JSON with your PGP key and paste the results below.  Or skip for now.

                <h1>4. Publish your listing on IPFS</h1>
                <p><a href='http://ipfs.io'>IPFS</a> is a peer-to-peer file system that allows your listing to be distributed and served by thousands of nodes all around the world.  IPFS is content-addressable so you need to know the hash of your listing to be able to find it on the IPFS network.  The IPFS node run by the 0rigin Foundation will pin all 0rigin listings it receives to improve speed and availability.</p>
                
                <h1>5. Publish to the Ethereum Network</h1>
                <p>While your listing is now available on IPFS, you still need to publish it to the Ethereum network by sending your IPFS hash to the 0rigin smart contract.  This smart contract acts as the authoritative source of all listings.  Once published on Ethereum, indexing nodes will be able to find and display your listing and consumers will be able to make a reservation or purchase directly through the smart contract.  No middle man or trusted third parties required.</p>
                <p>We've detected MetaMask or Mist... or follow these directions to manually publish your listing:</p>

                <p>Execute publish() on smart contract 0x1234 using 1234 gas and include d7afab4f in the data field.</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }
}

export default App;
