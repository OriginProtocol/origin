import React from 'react'
import superagent from 'superagent'

class Resolver extends React.Component {
  constructor(props) {
    super(props)

    setTimeout(() => {
      this.checkDnsPropagation()
    }, 100)

    this.checkDnsPropagation = this.checkDnsPropagation.bind(this)
  }

  async checkDnsPropagation() {
    const response = await superagent
      .get(`https://${this.props.config.subdomain}.${process.env.DAPP_CREATOR_DOMAIN}`)
      .then((response) => {
        console.log('DNS propagation complete')
      })
      .catch((error) => {
        console.log('DNS propagation incomplete')
      })
  }

  render () {
    return (
      <div className="resolver">
        <div>
          <img src="images/spinner-animation-dark.svg" />
          <h1>Setting up your marketplace...</h1>
          <h4>Please wait, this will take a few minutes.</h4>
        </div>
      </div>
    )
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
