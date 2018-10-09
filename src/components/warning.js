import React, { Component } from 'react'
import { connect } from 'react-redux'
import { FormattedMessage } from 'react-intl'

import { BetaBadge } from 'components/badges'
import getCurrentNetwork from 'utils/currentNetwork'

class Warning extends Component {
  render() {
    const { web3NetworkId } = this.props
    const currentNetwork = getCurrentNetwork(web3NetworkId)

    return (
      <div className="warning alert alert-warning">
        <div className="container">
          <div className="row">
            <div className="col">
              <div className="d-flex align-items-center">
                <BetaBadge />
                <div className="text-container">
                  <p>
                    <strong>
                      <FormattedMessage
                        id={'warning.message'}
                        defaultMessage={`You're currently using the Origin {currentNetwork} Beta.`}
                        values={{ currentNetwork }}
                      />
                    </strong>
                  </p>
                  <p>
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
                          >
                            GitHub
                          </a>
                        )
                      }}
                    />
                  </p>
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
