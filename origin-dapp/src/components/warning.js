import React, { Component } from 'react'
import { connect } from 'react-redux'
import { FormattedMessage } from 'react-intl'

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
    const { web3NetworkId } = this.props
    const currentNetwork = getCurrentNetwork(web3NetworkId)
    const networkType = currentNetwork && currentNetwork.type

    return (
      <div className={`warning alert alert-warning ${this.state.warningExpanded ? 'expanded' : ''}`} onClick={this.onWarningClick}>
        <div className="container">
          <div className="row">
            <div className="col">
              <div className="d-flex align-items-start">
                <BetaBadge />
                <div className="text-container mr-auto pt-1">
                  <p>
                    <strong id="desktop-message">
                      <FormattedMessage
                        id={'warning.desktopMessage'}
                        defaultMessage={`You're currently using the Origin {networkType}.`}
                        values={{ networkType }}
                      />
                    </strong>
                    <strong id="mobile-message">
                      <FormattedMessage
                        id={'warning.mobileMessage'}
                        defaultMessage={`Welcome to the Origin Beta!`}
                      />
                    </strong>
                  </p>
                  <p id="invitation-message">
                    <FormattedMessage
                      id={'warning.invitation'}
                      defaultMessage={`Found a bug? Open an issue on {github} or report it in our #bug-reports channel on {discord}.`}
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
                  <img id="caret-up" src="images/caret-up.svg" />
                  <img id="caret-down" src="images/caret-down.svg" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

const mapStateToProps = state => {
  return {
    web3NetworkId: state.app.web3.networkId
  }
}

export default connect(mapStateToProps)(Warning)
