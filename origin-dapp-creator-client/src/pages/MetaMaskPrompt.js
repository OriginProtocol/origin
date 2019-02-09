'use strict'

import React from 'react'

import MetaMaskCallToAction from 'components/MetaMaskCallToAction'
import Redirect from 'components/Redirect'

class MetaMaskPrompt extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      isError: false,
      redirect: null,
      signature: null
    }

    this.requestSignature = this.requestSignature.bind(this)
    this.publish = this.publish.bind(this)
  }

  async componentDidMount() {
    const signature = await this.requestSignature()
    await this.publish(signature)
  }

  async requestSignature() {
    let signature
    try {
      signature = await this.props.signConfig()
    } catch (error) {
      // Signing was rejected, go back
      this.setState({
        redirect: '/configure'
      })
    }

    this.setState({
      signature: signature
    })
  }

  async publish() {
    try {
      await this.props.handlePublish(this.state.signature)
    } catch (error) {
      this.setState({
        isError: true
      })
      return
    }
    this.setState({
      redirect: '/resolver'
    })
  }

  render() {
    return (
      <>
        {this.renderRedirect()}
        {this.state.isError && (
          <div className="error">
            There was an error publishing your configuration.
            <div>
              <button
                type="submit"
                className="btn btn-primary btn-lg"
                onClick={this.publish}
              >
                Retry
              </button>
            </div>
          </div>
        )}
        {!this.state.isError && (
          <div className="metamask-prompt">
            <div>
              <MetaMaskCallToAction />
              <h1>Publish Your New DApp</h1>
              <h4>
                Sign your configuration using MetaMask to complete the
                marketplace creation process.
              </h4>
            </div>
          </div>
        )}
      </>
    )
  }

  renderRedirect() {
    if (this.state.redirect !== null) {
      return <Redirect to={this.state.redirect} />
    }
  }
}

require('react-styl')(`
  .error
    text-align: center
    padding: 6rem 0
    .btn
      margin-top: 2rem
`)

export default MetaMaskPrompt
