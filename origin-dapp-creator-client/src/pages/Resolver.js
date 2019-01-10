import React from 'react'

class Resolver extends React.Component {
  constructor(props) {
    super(props)

    this.checkDnsPropagation = this.checkDnsPropagation.bind(this)
  }

  checkDnsPropagation() {
  }

  render () {
    return (
      <div class="resolver">
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
