import React, { Component } from 'react'
import { render } from 'react-dom'

class DemoStep4 extends Component {
  render() {
    return (
      <section className="step">
        <h4>Congratulations, your listing is now discoverable on the blockchain</h4>
        <p>
          Here is your Ethereum transaction id:
        </p>
        <pre>{this.props.ethereumTransaction}</pre>
        <p>
          Other users will now be able to see your listing associated with your
          Ethereum wallet address.
        </p>
        <p>
          In the future, Origin will make it easy to browse all product and service
          listings submitted to the smart contract in an easy-to-use interface. Buyers
          will be able to browse just as they would on Amazon or another commerce site,
          but everything will be distributed and trustless and not subject to the
          governance of a centralized company or government.
        </p>
      </section>
    );
  }
}

export default DemoStep4
