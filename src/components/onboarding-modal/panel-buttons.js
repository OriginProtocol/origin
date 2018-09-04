import React, { Component, Fragment } from 'react'
import { Link } from 'react-router-dom'

export default class PanelButtons extends Component {
  constructor(props) {
    super(props)

    this.connectMetaMask = this.connectMetaMask.bind(this)
  }

  connectMetaMask() {
    this.props.displayNextStep()
  }

  render() {
    const { displayNextStep, step } = this.props
    const buttons = {
      'Overview': (
        <button
          className='btn btn-primary'
          onClick={displayNextStep}
        >
          Connect a Wallet
        </button>
      ),
      'Connect Wallet': (
        <div className="d-flex flex-column align-items-center">
          <button key={'first-btn'}
            className='btn btn-primary btn-lg mb-3'
            onClick={this.connectMetaMask}
          >
            Connect Metamask
          </button>
          <button key={'sec-btn'}
            className='btn btn-primary btn-lg'
            disabled
          >
            Download Mobile Wallet
          </button>
        </div>
      ),
      'Connected': (
        <button
          className='btn btn-primary'
          onClick={displayNextStep}
        >
          Learn about Origin Tokens
        </button>
      ),
      'Get Origin Tokens': (
        <div className="col-auto">
          <Link to="/about-tokens" target="_blank">
            <button key={'first-btn'} className='btn btn-primary'>
              Learn more
            </button>
          </Link>
        </div>
      )
    }

    return <div className="panel-buttons"> {buttons[step.name]} </div>
  }
}
