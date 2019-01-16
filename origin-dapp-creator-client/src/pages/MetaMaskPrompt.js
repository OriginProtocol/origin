'use strict'

import React from 'react'

import Redirect from 'components/Redirect'

class MetaMaskPrompt extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      redirect: null
    }
  }

  async componentDidMount () {
    try {
      await this.props.handlePublish()
    } catch (error) {
      // TODO: handle rejection
    }
    this.props.
    console.log('Signed')
    this.setState({
      redirect: '/success'
    })
  }

  render () {
    return (
      <div className="metamask-prompt">
        {this.renderRedirect()}
        <div>
          <img src="images/metamask.svg" />
          <h1>Waiting for you to grant permission</h1>
          <h4>Please grant Origin permission to access your Metamask account so you can publish your marketplace.</h4>
        </div>
      </div>
    )
  }

  renderRedirect () {
    if (this.state.redirect !== null) {
      return <Redirect to={this.state.redirect} />
    }
  }
}

require('react-styl')(`
  .metamask-prompt
    text-align: center
    padding: 6rem 0

  .metamask-prompt img
    width: 90px
    height: 90px
    margin: 2rem 0
`)

export default MetaMaskPrompt
