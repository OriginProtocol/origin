import React from 'react'

class Resolver extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      redirect: null
    }
  }

  componentDidMount () {
    await this.props.handlePublish()
    // TODO: handle rejection
    this.setState({
      redirect: '/success'
    })
  }

  render () {
    return (
      <div class="metamask-prompt">
        {this.renderRedirect()}
        <div>
          <img src="images/metamask.svg" />
          <h1>Waiting for MetaMask</h1>
          <h4>Please sign the prompt from MetaMask.</h4>
        </div>
      </div>
    )
  }

  renderRedirect () {
    if (this.state.redirect !== null) {
      return <Redirect to={this.state.redirect} />
    }
  }
}

require('react-styl')(`
  .metamask-prompt
    text-align: center
    padding: 6rem 0

  .metamask-prompt img
    width: 90px
    height: 90px
    margin: 2rem 0
`)

export default Resolver
