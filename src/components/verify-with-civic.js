import React, { Component } from 'react'
import { userRegistryService } from '@originprotocol/origin'

const alertify = require('../../node_modules/alertify/src/alertify.js')

class LoginWithCivic extends Component {
  constructor(props) {
    super(props)

    // Instantiate civic hosted solution
    this.civicSip = new window.civic.sip({ appId: process.env.CIVIC_APP_ID })

    // Listen for civic auth response
    this.civicSip.on('auth-code-received', function (event) {

      let encryptedCivicJWT = event.response

      let payload = JSON.stringify({"jwt": encryptedCivicJWT})

      console.log("Civic Payload to decrypt", payload)
      alertify.log("Civic Payload to decrypt:\n" + payload.toString())

      fetch("https://civic-proxy.originprotocol.com/civic/login", {
          method: "POST",
          headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
          },
          body: payload
      }).then(function(res) {
          return res.json()
      }).then(function(decryptedCivicJWT) {

          let payload = {
              "loginService": "civic",
              "data": decryptedCivicJWT
          }

          userRegistryService.create(payload).then((userFromBlockchain) => {
              alertify.log("userFromBlockchain:\n" + userFromBlockchain.toString())
              console.log("userFromBlockchain", userFromBlockchain)

          }).catch((error) => {
              alertify.log('There was an error attempting to login with Civic.')
              console.error(error)
          })

      })
    })

    // Listen for civic modal close by user
    this.civicSip.on('user-cancelled', function (event) {
        console.log(event)
    })

    // Listen for when mobile app scans QR code
    this.civicSip.on('read', function (event) {
      console.log(event)
    })

    // Alert if civic error
   this.civicSip.on('civic-sip-error', function (error) {
     console.log(error)
     alertify.log(error)
    })

    this.civicLogin = this.civicLogin.bind(this)
  }

  civicLogin() {
    this.civicSip.signup({ style: 'popup', scopeRequest: this.civicSip.ScopeRequests.BASIC_SIGNUP })
  }

  render() {
    return (
      <button className="service verified" onClick={() => this.civicLogin()}>
        <div className="icon-container">
          <img src="/images/civic-icon.svg" alt="Civic icon" />
        </div>
        <p>Civic</p>
        <div className="icon-container"></div>
      </button>
    )
  }
}

export default LoginWithCivic
