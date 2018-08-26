import React, { Component } from 'react'
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
      'Overview': <button key={'first-btn'} className='btn btn-primary' onClick={displayNextStep}>Connect a Wallet</button>,
      'Connect Wallet': [
          <button key={'first-btn'} className='btn btn-primary' onClick={this.connectMetaMask}>Connect Metamask</button>,
          <button key={'sec-btn'} className='btn btn-primary' disabled={true}>Download Mobile Wallet</button>
      ],
      'Connected': <button key={'first-btn'} className='btn btn-primary' onClick={displayNextStep}>Learn more</button>,
      'Get Origin Tokens': <Link to="/about-origin"><button key={'first-btn'} className='btn btn-primary' onClick={this.aboutOrigin}>Learn about Origin Tokens</button></Link>
    }

    return(
      <div>
        {buttons[step.name]}
      </div>
    )
  }
}
