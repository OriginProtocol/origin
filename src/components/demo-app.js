import React, { Component } from 'react'

import DemoStep1 from './demo-step-1'
import DemoStep2 from './demo-step-2'
import DemoStep3 from './demo-step-3'
import DemoStep4 from './demo-step-4'
import NavigationBar from './navigation-bar'

const log = (type) => console.log.bind(console, type)

import '../css/demo-app.css'
import '../css/open-sans.css'
import '../css/oswald.css'
import '../css/pure-min.css'

class DemoApp extends Component {
  constructor(props) {
    super(props)

    this.state = {
      step: 1,
      listingJson: null,
      ipfsHash: null,
      ethereumTransaction: null
    }

    this.handleStep1Completion = this.handleStep1Completion.bind(this)
    this.handleStep2Completion = this.handleStep2Completion.bind(this)
    this.handleStep3Completion = this.handleStep3Completion.bind(this)
  }

  handleStep1Completion(listingJson) {
    this.setState({
      step: 2,
      listingJson: listingJson
    })
  }

  handleStep2Completion(ipfsHash) {
    this.setState({
      step: 3,
      ipfsHash: ipfsHash
    })
  }

  handleStep3Completion(ethereumTransaction) {
    this.setState({
      step: 4,
      ethereumTransaction: ethereumTransaction
    })
  }

  render() {
    return (
      <div className="demo-app">
        <NavigationBar />
        <main className="container demo-container">
          <div className="row">
            <div className="col-md-offset-2 col-md-8">
              {this.state.step == 1 &&
                <DemoStep1 onStep1Completion={this.handleStep1Completion}/>
              }
              {this.state.step == 2 &&
                <DemoStep2 
                  listingJson={this.state.listingJson} 
                  onStep2Completion={this.handleStep2Completion}
                />
              }
              {this.state.step == 3 &&
                <DemoStep3 
                  ipfsHash={this.state.ipfsHash} 
                  onStep3Completion={this.handleStep3Completion}
                />
              }
              {this.state.step == 4 &&
                <DemoStep4 
                  ethereumTransaction={this.state.ethereumTransaction} 
                />
              }
            </div>
          </div>
        </main>
      </div>
    );
  }
}

export default DemoApp
