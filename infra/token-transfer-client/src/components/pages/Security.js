import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import get from 'lodash.get'

import { fetchAccounts } from '@/actions/account'
import BorderedCard from '@/components/BorderedCard'
import GoogleAuthenticatorIcon from '@/assets/google-authenticator-icon@3x.jpg'
import AccountTable from '@/components/AccountTable'
import SessionTable from '@/components/SessionTable'

class Security extends Component {
  constructor(props) {
    super(props)
  }

  componentDidMount() {
    this.props.fetchAccounts()
  }

  isLoading = () => {
    return this.props.account.isFetching
  }

  renderLoading() {
    return (
      <div className="spinner-grow" role="status">
        <span className="sr-only">Loading...</span>
      </div>
    )
  }

  render() {
    if (this.isLoading()) {
      return this.renderLoading()
    }

    return (
      <>
        <h1>Security</h1>
        <div className="row">
          <div className="col-xs-12 col-lg-6">
            <BorderedCard>
              <div className="row">
                <div className="col-md-6">{get(this.props.user, 'email')}</div>
                <div className="col-md-6 text-md-right">
                  <a
                    href="mailto:support@originprotocol.com?subject=Change Investor Email"
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

        <AccountTable />

        <SessionTable />
      </>
    )
  }
}

const mapStateToProps = ({ account }) => {
  return { account }
}

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      fetchAccounts: fetchAccounts
    },
    dispatch
  )

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Security)
