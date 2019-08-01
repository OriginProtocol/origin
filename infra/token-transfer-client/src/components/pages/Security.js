import React, { Component } from 'react'
import { connect } from 'react-redux'

import BorderedCard from '../BorderedCard'
import GoogleAuthenticatorIcon from '../../assets/google-authenticator-icon@3x.jpg'
import WalletTable from '../WalletTable'

class Security extends Component {
  constructor(props) {
    super(props)
    this.state = {}
  }

  handleChangeEmail = () => {}

  render() {
    return (
      <>
        <h1>Security</h1>
        <div className="row">
          <div className="col-xs-12 col-lg-6">
            <BorderedCard>
              <div className="row">
                <div className="col-md-6">{this.props.sessionEmail}</div>
                <div className="col-md-6 text-md-right">
                  <a href="mailto:support@originprotocol.com?subject=Change Investor Email"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Change email
                  </a>
                </div>
              </div>
            </BorderedCard>
          </div>

          <div className="col-xs-12 col-lg-6">
            <BorderedCard>
              <div className="row">
                <div
                  className="d-none d-md-block col-md-2"
                  style={{
                    backgroundImage: `url(${GoogleAuthenticatorIcon})`,
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: 'contain',
                    margin: '-20px -10px -20px 0'
                  }}
                ></div>
                <div className="col-md-8">Google Authenticator</div>
                <div className="col-md-2 text-md-right">
                  <a href="mailto:support@originprotocol.com?subject=Help with Google Authenticator">
                    Help
                  </a>
                </div>
              </div>
            </BorderedCard>
          </div>
        </div>

        <WalletTable />

        <h2>Session History</h2>
      </>
    )
  }
}

const mapStateToProps = state => {
  return {
    sessionEmail: state.sessionEmail
  }
}

const mapDispatchToProps = () => {
  return {}
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Security)
