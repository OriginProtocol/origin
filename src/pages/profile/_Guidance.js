import React, { Component } from 'react'

class Guidance extends Component {
  render() {
    return (
      <div className="guidance">
        <div className="image-container text-center">
          <img src="images/identity.svg" alt="identity icon" />
        </div>
        <p>
          <strong>Verifying your profile</strong> allows other users to know
          that you are a real person and increases the chances of successful transactions
          on Origin.
        </p>
      </div>
    )
  }
}

export default Guidance
