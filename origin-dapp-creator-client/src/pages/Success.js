import React from 'react'

class Success extends React.Component {
  constructor(props) {
    super(props)

    this.checkDnsPropagation = this.checkDnsPropagation.bind(this)
  }

  checkDnsPropagation() {
  }

  render () {
    return (
      <div class="success">
        <img src="images/spinner-animation-dark.svg" />
        <h1>Congratulations!</h1>
        <h4>You've finished setting up your marketplace.</h4>
      </div>
    )
  }
}

require('react-styl')(`
  .success
    text-align: center
    padding: 6rem 0

  .success img
    width: 90px
    height: 90px
    margin: 2rem 0
`)

export default Success
