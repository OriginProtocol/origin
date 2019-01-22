'use strict'

import React from 'react'

import Redirect from 'components/Redirect'

class MetaMaskPrompt extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      isError: false,
      redirect: null
    }

    this.requestSignature = this.requestSignature.bind(this)
    this.publish = this.publish.bind(this)
  }

  async componentDidMount () {
    const signature = await this.requestSignature()
    await this.publish(signature)
  }

  async requestSignature () {
    let signature = null
    try {
      signature = await this.props.signConfig()
    } catch (error) {
      // Signing was rejected, go back
      this.setState({
        redirect: '/configure'
      })
    }
  }

  async publish (signature) {
    try {
      await this.props.handlePublish(signature)
    } catch (error) {
      this.setState({
        isError: true
      })
    }
    this.setState({
      redirect: '/resolver'
    })
  }

  render () {
    return (
      <>
        {this.state.isError &&
          <div className="error">
            There was an error publishing your configuration.
            <div>
              <button type="submit" className="btn btn-primary btn-lg" onClick={this.publish}>
                Retry
              </button>
            </div>
          </div>
        }
        {!this.state.isError &&
          <div className="metamask-prompt">
            {this.renderRedirect()}
            <div>
              <img src="images/metamask.svg" />
              <h1>Waiting for you to grant permission</h1>
              <h4>Please grant Origin permission to access your Metamask account so you can publish your marketplace.</h4>
            </div>
          </div>
        }
      </>
    )
  }

  renderRedirect () {
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

  .metamask-prompt
    text-align: center
    padding: 6rem 0

  .metamask-prompt img
    width: 90px
    height: 90px
    margin: 2rem 0
`)

export default MetaMaskPrompt
