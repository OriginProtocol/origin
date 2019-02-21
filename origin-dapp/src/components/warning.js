import React, { Component } from 'react'
import { connect } from 'react-redux'
import { FormattedMessage } from 'react-intl'

import { openBetaModal } from 'actions/App'

import { BetaBadge } from 'components/badges'

import getCurrentNetwork from 'utils/currentNetwork'

class Warning extends Component {
  constructor() {
    super()
    this.state = {
      warningExpanded: false
    }

    this.onWarningClick = this.onWarningClick.bind(this)
  }

  onWarningClick() {
    this.setState({ warningExpanded: !this.state.warningExpanded })
  }

  render() {
    const { config, openBetaModal, web3NetworkId } = this.props
    const currentNetwork = getCurrentNetwork(web3NetworkId)
    const networkType = currentNetwork && currentNetwork.type
    let { title } = config

    if (!title) {
      title = 'Origin'
    }

    let wrapperClass = 'warning alert alert-warning'
    if (this.state.warningExpanded)
      wrapperClass += ' expanded'
    if (!this.props.showWelcome)
      wrapperClass += ' d-none'

    return (
      <div className={wrapperClass} onClick={this.onWarningClick}>
        <div className="container">
          <div className="row">
            <div className="col">
              <div className="d-flex align-items-start align-items-md-center">
                <BetaBadge />
                <div className="text-container mr-auto pt-1">
                  <p>
                    <strong id="desktop-message">
                      <FormattedMessage
                        id={'warning.desktopMessage'}
                        defaultMessage={`You're currently using {title} Beta on {networkType}.`}
                        values={{ title, networkType }}
                      />
                      &nbsp;
                      <a className="reminders" onClick={openBetaModal}>Important Reminders</a>
                    </strong>
                    <strong id="mobile-message">
                      <FormattedMessage
                        id={'warning.mobileMessage'}
                        defaultMessage={`Welcome to {title} Beta!`}
                        values={{ title }}
                      />
                      &nbsp;
                      <a className="reminders" onClick={openBetaModal}>Reminders</a>
                    </strong>
                  </p>
                  <p id="invitation-message">
                    <FormattedMessage
                      id={'warning.invitation'}
                      defaultMessage={`Found a bug or have feedback? Send an email to {email}, open an issue on {github}, or post in our #bug-reports channel on {discord}.`}
                      values={{
                        discord: (
                          <a
                            href="https://discord.gg/jyxpUSe"
                            target="_blank"
                            rel="noopener noreferrer"
                            ga-category="beta"
                            ga-label="banner_discord_report_bug"
                            onClick={(e) => e.stopPropagation()} // prevent parent divs receiving onClick event
                          >
                            Discord
                          </a>
                        ),
                        email: (
                          <a
                            href="mailto:support@originprotocol.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            ga-category="beta"
                            ga-label="banner_discord_report_bug"
                            onClick={(e) => e.stopPropagation()} // prevent parent divs receiving onClick event
                          >
                            support@originprotocol.com
                          </a>
                        ),
                        github: (
                          <a
                            href="https://github.com/OriginProtocol/origin-dapp/issues/new"
                            target="_blank"
                            rel="noopener noreferrer"
                            ga-category="beta"
                            ga-label="banner_github_report_bug"
                            onClick={(e) => e.stopPropagation()} // prevent parent divs receiving onClick event
                          >
                            GitHub
                          </a>
                        )
                      }}
                    />
                  </p>
                </div>
                <div className="pr-1 pl-3 caret">
                  <img src="images/caret-grey.svg" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

const mapStateToProps = ({ app, config }) => {
  return {
    config,
    showWelcome: app.showWelcome,
    web3NetworkId: app.web3.networkId
  }
}

const mapDispatchToProps = dispatch => ({
  openBetaModal: () => dispatch(openBetaModal())
})

export default connect(mapStateToProps, mapDispatchToProps)(Warning)
