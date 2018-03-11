import React, { Component } from 'react'
import loginService from '../services/login-service'

const alertify = require('../../node_modules/alertify/src/alertify.js')

class Login extends Component {

  constructor(props) {
    super(props)

    //instantiate civic hosted solution
    this.civicSip = new window.civic.sip({ appId: process.env.CIVIC_APP_ID });

    // Listen for civic auth response
    this.civicSip.on('auth-code-received', function (event) {
      console.log(event);
      let jwt = event.response;
      loginService.login(jwt).then((loginResponse) => {
          alert("Civic JWT needs to be decrypted: " + loginResponse)
      })
      .catch((error) => {
          alertify.log('There was an error attempting to login.')
          console.error(error);
      })
    });

    // Listen for civic modal close by user
    this.civicSip.on('user-cancelled', function (event) {
        console.log(event);
    });

    // Listen for when mobile app scans QR code
    this.civicSip.on('read', function (event) {
      console.log(event);
    });

    // Alert if civic error
   this.civicSip.on('civic-sip-error', function (error) {
     console.log(error);
     alertify.log(error);
    });

    this.civicLogin = this.civicLogin.bind(this)
  }

  civicLogin() {
    this.civicSip.signup({ style: 'popup', scopeRequest: this.civicSip.ScopeRequests.BASIC_SIGNUP });
  }

  render() {
    return (
      <div className="container listing-form">

          <div className="step-container pick-schema">
            <div className="row flex-sm-row-reverse">
             <div className="col-md-5 offset-md-2">
                <div className="info-box">
                  <h2>Choose a secure identity provider</h2>
                  <p>Pro Tip: Provide as many forms of identity as possible to strengthen your reputation.</p>
                  <div className="info-box-image"><img className="d-none d-md-block" src="/images/features-graphic.svg" role="presentation" /></div>
                </div>
              </div>

              <div className="col-md-5">
                <h2>Choose a login method</h2>

                <div className="btn-container">
                  <button className="float-left btn btn-primary" onClick={() => this.civicLogin()}>
                    Civic Login
                  </button>
                </div>
              </div>
            </div>
          </div>

      </div>
    )
  }
}

export default Login
