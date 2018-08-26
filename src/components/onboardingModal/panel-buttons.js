import React, { Component } from 'react'

export default class PanelButtons extends Component {
  constructor(props) {
    super(props)

    this.connectMetaMask = this.connectMetaMask.bind(this)
    this.learnAbout = this.learnAbout.bind(this)
  }
  connectMetaMask() {
    this.props.displayNextStep()
  }
  learnAbout() {
    console.log("Navigate to Learn About")
  }
  render() {
    const { displayNextStep, currentStep } = this.props
    const buttons = {
      'Overview': <button key={'first-btn'} className='btn btn-primary' onClick={displayNextStep}>Connect a Wallet</button>,
      'Connect Wallet': [
          <button key={'first-btn'} className='btn btn-primary' onClick={this.connectMetaMask}>Connect Metamask</button>,
          <button key={'sec-btn'} className='btn btn-primary' disabled={true}>Download Mobile Wallet</button>
      ],
      'Get Origin Tokens': <button key={'first-btn'} className='btn btn-primary' onClick={this.learnAbout}>Learn about Origin Tokens</button>
    }

    return(
      <div>
        {buttons[currentStep.name]}
      </div>
    )
  }
}
