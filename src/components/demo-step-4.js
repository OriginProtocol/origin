import React, { Component } from 'react'
import { render } from 'react-dom'

class DemoStep4 extends Component {
  render() {
    return (
      <div className="step">
        <h2 className="step-title">Step 4</h2>
        <p className="step-content">
          Step 4 content goes here
        </p>
        <p>
          The listing is now available on the Ethereum blockchain. blhalbhalbhal.
        </p>
        <p>
          Ethereum tx hash: {this.props.ethereumTransaction}
        </p>
      </div>
    );
  }
}

export default DemoStep4
