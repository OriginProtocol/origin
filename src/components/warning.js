import React, { Component } from 'react'
import { FormattedMessage } from 'react-intl'

class Warning extends Component {
  render() {
    return (
      <div className="warning alert alert-warning">
        <div className="container">
          <div className="row">
            <div className="col">
              <div className="d-flex align-items-center">
                <span className="badge badge-primary">
                  <FormattedMessage
                    id={'warning.badge'}
                    defaultMessage={'Beta'}
                  />
                </span>
                <div className="text-container">
                  <p>
                    <strong>
                      <FormattedMessage
                        id={'warning.message'}
                        defaultMessage={`You're currently using the Origin Mainnet Beta.`}
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
                          >
                            Discord
                          </a>
                        ),
                        github: (
                          <a
                            href="https://github.com/OriginProtocol/origin-dapp/issues/new"
                            target="_blank"
                            rel="noopener noreferrer"
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

export default Warning
