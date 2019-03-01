'use strict'

import React from 'react'
import superagent from 'superagent'

import Redirect from 'components/Redirect'

class Resolver extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      redirect: null
    }

    this.checkDnsPropagation = this.checkDnsPropagation.bind(this)
    this.redirectToSuccess = this.redirectToSuccess.bind(this)
  }

  componentWillMount() {
    this.timer = setInterval(() => {
      this.checkDnsPropagation()
    }, 5000)
  }

  componentWillUnmount() {
    clearInterval(this.timer)
  }

  async checkDnsPropagation() {
    const dappHostname = `${this.props.config.subdomain}.${
      process.env.DAPP_CREATOR_DOMAIN
    }`
    await superagent
      .get(`https://cloudflare-dns.com/dns-query`)
      .set({ Accept: 'application/dns-json' })
      .query({ name: dappHostname })
      .type('json')
      .then(response => {
        const json = JSON.parse(response.text)
        if (json.Status === 0) {
          this.redirectToSuccess()
        }
      })
  }

  async redirectToSuccess() {
    this.setState({
      redirect: '/success'
    })
  }

  render() {
    return (
      <div className="resolver">
        {this.renderRedirect()}
        <div>
          <img src="images/spinner-animation-dark.svg" />
          <h1>Setting up your marketplace...</h1>
          <h4>Please wait. This will take a few minutes.</h4>
          <p>
            If you ever need to edit your marketplace, you can repeat this
            process. Make sure you use the same subdomain and Ethereum wallet.
          </p>
        </div>
      </div>
    )
  }

  renderRedirect() {
    if (this.state.redirect !== null) {
      return <Redirect to={this.state.redirect} />
    }
  }
}

require('react-styl')(`
  .resolver
    text-align: center
    padding: 6rem 0

  .resolver img
    width: 90px
    height: 90px
    margin: 2rem 0
`)

export default Resolver
