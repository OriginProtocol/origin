import React, { Component } from 'react'
import { connect } from 'react-redux'

import BorderedCard from '../BorderedCard'
import GoogleAuthenticatorIcon from '../../assets/google-authenticator-icon@3x.jpg'
import Modal from '../Modal'

class Security extends Component {
  constructor(props) {
    super(props)
    this.state = {
      displayChangeEmailModal: false
    }
  }

  handleChangeEmail = () => {}

  renderEmailModal() {
    return (
      <Modal
        title="Change Email"
        onClose={() => this.setState({ displayChangeEmailModal: false })}
      >
        <h2>New Email</h2>
      </Modal>
    )
  }

  render() {
    return (
      <>
        <h1>Security</h1>
        <div className="row">
          <div className="col">
            <BorderedCard>
              <div className="row">
                <div className="col">{this.props.sessionEmail}</div>
                <div className="col text-right">
                  <a href="" onClick={this.handleChangeEmail}>
                    Change email
                  </a>
                </div>
              </div>
            </BorderedCard>
          </div>

          <div className="col">
            <BorderedCard>
              <div className="row">
                <div
                  className="col-2"
                  style={{
                    backgroundImage: `url(${GoogleAuthenticatorIcon})`,
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: 'contain',
                    margin: '-20px -10px -20px 0'
                  }}
                ></div>
                <div className="col">Google Authenticator</div>
                <div className="col-4 text-right">
                  <a href="">Help</a>
                </div>
              </div>
            </BorderedCard>
          </div>
        </div>

        <div className="row">
          <div className="col">
            <h2>Ethereum Accounts</h2>
          </div>
        </div>

        <div className="row">
          <div className="col">
            <h2>Session History</h2>
          </div>
        </div>
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
