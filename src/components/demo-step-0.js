import React, { Component } from 'react'
import { render } from 'react-dom'

import contractService from '../services/contract-service'

class DemoStep0 extends Component {

  componentDidMount() {

    setTimeout(function(){
      contractService.getAllListings().then((count) => {
        alert(count)
      }).catch((error) => {
          alert('Error:  ' + error)
      });
    }, 2000);

  }

  render() {
    return (
      <section className="step">
        <h3>Browse 0rigin Listings</h3>
        <p>
          Look for things like housing, auto, and services.
        </p>

      </section>
    );
  }
}

export default DemoStep0
