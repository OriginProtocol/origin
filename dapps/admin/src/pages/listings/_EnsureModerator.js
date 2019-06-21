import React, { Component } from 'react'
import { AnchorButton } from '@blueprintjs/core'
import { query, timeRemaining, persistAccessToken } from '../../utils/discovery'
import Web3 from 'web3'

const AUTH_TOKEN_MUTATION = `
mutation($message: String!, $signature: String!, $ethAddress: String!) {
  accessTokenCreate(message: $message, signature: $signature, ethAddress: $ethAddress){
      authToken
      secondsToExpiration
      ethAddress
  }
}
`

const PRE_EXPIRE_SECONDS = 120

/**
 * Only shows the child component if the user has an active moderator token,
 * otherwise shows a login button.
 */
class EnsureModerator extends Component {
  constructor(props) {
    super(props)
    this.state = {
      isLoggedIn: false,
      isError: false
    }
    this.timer = undefined
    this.update()
  }

  startLogin = async () => {
    // Ensure metamask is active
    const addresses = await window.ethereum.enable()
    const ethAddress = addresses[0]

    // Create message
    const nonce = Web3.utils.randomHex(12)
    const message = `\x19Ethereum Signed Message:\nOrigin Moderation Login\nNonce: ${nonce}`
    const signature = await window.web3.eth.sign(message, ethAddress)

    // Post to discovery server
    const data = await query(AUTH_TOKEN_MUTATION, {
      message,
      signature,
      ethAddress
    })
    if (data.errors) {
      this.setState({ isError: true })
      console.error(data.errors)
      const niceError = data.errors[0].message.replace(
        'Unexpected error value: ',
        ''
      )
      alert('Could not log you in for moderation. \n' + niceError)
      return
    }
    // Save token localy
    const { authToken, secondsToExpiration } = data.data.accessTokenCreate
    const expires = new Date().getTime() + secondsToExpiration * 1000
    persistAccessToken({ authToken, expires, ethAddress })
    this.setState({ authToken, expires, isError: false })
    this.update()
  }

  isLoggedIn() {
    return timeRemaining() > PRE_EXPIRE_SECONDS * 1000
  }

  update() {
    if (this.timer != undefined) {
      clearTimeout(this.timer)
    }
    const isLoggedIn = this.isLoggedIn()
    let nextCheck = 10 * 1000
    if (isLoggedIn) {
      nextCheck = Math.min(
        12 * 1000,
        Math.max(1 * 1000, timeRemaining() - PRE_EXPIRE_SECONDS * 1000)
      )
    }

    this.timer = setTimeout(() => {
      this.update()
    }, nextCheck)

    if (this.state.isLoggedIn != isLoggedIn) {
      this.setState({ isLoggedIn })
    }
  }

  render() {
    if (this.isLoggedIn()) {
      return this.props.children
    }
    return (
      <AnchorButton
        text="Login"
        onClick={this.startLogin}
        minimal={this.state.isError}
      />
    )
  }

  componentWillUnmount() {
    clearTimeout(this.timer)
  }
}

export default EnsureModerator
