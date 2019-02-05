'use strict'

import React from 'react'

import MetaMaskCallToAction from 'components/MetaMaskCallToAction'
import Steps from 'components/Steps'

class MetaMaskRequirement extends React.Component {
  render() {
    return (
      <>
        <div className="logo">
          <img src="images/origin-logo.svg" className="logo" />
        </div>

        <div className="main">
          <Steps />

          <div className="form">
            <div className="metamask-prompt">
              <div>
                <MetaMaskCallToAction />
                {!window.web3 && (
                  <>
                    <h1>MetaMask Required</h1>
                    <h4>
                      You must install the MetaMask browser extension to be able
                      to create your own marketplace.
                    </h4>
                    <a
                      href="https://metamask.io/"
                      className="btn btn-primary btn-lg"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Install MetaMask
                    </a>
                    <p className="reminder">
                      You may need to refresh your browser after installing
                      MetaMask.
                    </p>
                  </>
                )}
                {window.web3 && (
                  <>
                    <h1>MetaMask Account Access Required</h1>
                    <h4>
                      Please enable access to your MetaMask account so that it
                      can be used to create your marketplace. You will need to
                      sign in and grant permission for Origin to view your
                      account.
                    </h4>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </>
    )
  }
}

require('react-styl')(`
  .reminder
    color: var(--light)
    font-weight: 300
    margin-top: 2.5rem
`)

export default MetaMaskRequirement
