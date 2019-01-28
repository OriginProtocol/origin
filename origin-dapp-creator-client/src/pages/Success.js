import React from 'react'

class Success extends React.Component {
  constructor(props) {
    super(props)

    this.openMarketplace = this.openMarketplace.bind(this)
  }

  openMarketplace() {
    window.open(
      `https://${this.props.config.subdomain}.${process.env.DAPP_CREATOR_DOMAIN}`,
      '_blank'
    )
  }

  render () {
    return (
      <div className="success">
        <img src="images/celebration-icon.svg" />
        <h1>Congratulations!</h1>
        <h4>You&apos;ve finished setting up your marketplace.</h4>
        <button className="btn btn-primary btn-lg"
            onClick={this.openMarketplace}>
          Go to my marketplace
        </button>
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
`)

export default Success
