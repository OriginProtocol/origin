import React, { Component } from 'react'

import ListingForm from './listing-form'
import web3Service from './utils/web3-service'

import './App.css'
import './css/open-sans.css'
import './css/oswald.css'
import './css/pure-min.css'

let selectedSchema = {
  type: "object",
  required: ["name"],
  properties: {
    name: {
      type: "string", 
      title: "Name", 
      default: "An M3"
    },
    category: {
      type: "string", 
      title: "Category", 
      enum: [
        "housing",
        "transportation",
        "labor"
      ],
      enumNames: [
        "Housing",
        "Transportation",
        "Labor"
      ]
    },
    price: {
      type: "number", 
      title: "Price", 
    },
  }
};

class App extends Component {

  render() {
    return (
      <div className="App">
        <nav className="navbar pure-menu pure-menu-horizontal">
            <a href="#" className="pure-menu-heading pure-menu-link">Origin - ICO ICO</a>
        </nav>
        <main className="container">
          <div className="row">
            <div className="col-md-offset-2 col-md-8">
              <div className="pure-g">
                <div className="pure-u-1-1">
                  <ListingForm 
                    schema={selectedSchema}/>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }
}

export default App
