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
        <Fragment>
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
        </Fragment>
      ),
      'Connected': (
        <button
          className='btn btn-primary'
          onClick={displayNextStep}
        >
          Learn more
        </button>
      ),
      'Get Origin Tokens': (
        <Link to="/about-tokens">
          <button key={'first-btn'} className='btn btn-primary btn-lg'>
            Learn about Origin Tokens
          </button>
        </Link>
      )
    }

    return(
      <div className="m-5" >
        {buttons[step.name]}
      </div>
    )
  }
}
