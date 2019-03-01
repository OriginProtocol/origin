'use strict'

import React from 'react'

import Redirect from 'components/Redirect'

class Success extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      setCustomDomain: false
    }

    this.openMarketplace = this.openMarketplace.bind(this)
  }

  openMarketplace() {
    window.open(
      `https://${this.props.config.subdomain}.${
        process.env.DAPP_CREATOR_DOMAIN
      }`,
      '_blank'
    )
  }

  render() {
    if (this.state.setCustomDomain) {
      return <Redirect to={`/customdomain`} push />
    }

    return (
      <div className="success">
        <img src="images/celebration-icon.svg" />
        <h1>Congratulations!</h1>
        <h4>You&apos;ve finished setting up your marketplace.</h4>
        <p>
          <strong>Would you like to set up a custom domain?</strong>
        </p>
        <p>
          A custom domain will make it easier for buyers and sellers to find
          your marketplace.
        </p>
        <div className="success-actions">
          <button
            className="btn btn-primary btn-lg"
            onClick={this.openMarketplace}
          >
            No thanks, I&apos;m done
          </button>
          <button
            className="btn btn-primary btn-lg"
            onClick={() => this.setState({ setCustomDomain: true })}
          >
            Yes, Please
          </button>
        </div>
      </div>
    )
  }
}

require('react-styl')(`
  .success
    text-align: center
    padding: 2rem 0

  .success img
    width: 180px
    height: 180px
    margin: 2rem 0

  .success-actions
    margin-top: 2rem
    text-align: center

  .success-actions button
    margin-right: 1rem
`)

export default Success
