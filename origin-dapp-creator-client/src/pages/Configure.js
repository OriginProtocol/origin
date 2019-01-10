'use strict'

import React from 'react'

import Redirect from 'components/Redirect'

class Configure extends React.Component {
  constructor(props, context) {
    super(props)

    this.state = {
      config: props.config,
      redirect: null,
      publishing: false
    }

    this.toggleFilterByType = this.toggleFilterByType.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
  }

  toggleFilterByType (event) {
    this.setState({
      config: {
        ...this.state.config,
        listingFilters: {
          marketplacePublisher: event.target.checked ? web3.eth.accounts[0] : null
        }
      }
    })
  }

  async handleSubmit (event) {
    event.preventDefault()
    this.setState({
      publishing: true
    })
    await this.props.handlePublish(event)
    this.setState({
      redirect: '/resolver',
      publishing: false
    })
  }

  render () {
    return (
      <form onSubmit={this.handleSubmit}>
        {this.renderRedirect()}

        <h1>Configure your Marketplace</h1>
        <h4>Finish setting up your marketplace with the options below.</h4>

        <div className="form-group">
          <label>Filtering</label>

          <div className="option">
            Limit to only my own
            <input className="form-check-input"
              type="checkbox"
              onClick={this.toggleFilterByType} />
          </div>

          <div className="option disabled">
            Limit by type (coming soon)
            <input className="form-check-input" type="checkbox" name="" disabled />
          </div>
        </div>

        <div className="form-actions clearfix">
          <button onClick={() => this.setState({ redirect: '/customize' })}
              className="btn btn-outline-primary btn-lg btn-left">
            Back
          </button>

          <button type="submit"
              className="btn btn-primary btn-lg btn-right"
              onClick={this.handleSubmit}
              disabled={this.state.publishing}>
            {this.state.publishing ?
              <span>Loading</span> : <span>Done</span>
            }
          </button>
        </div>
      </form>
    )
  }

  renderRedirect () {
    if (this.state.redirect !== null) {
      return <Redirect to={this.state.redirect} />
    }
  }
}

require('react-styl')(`
  .option
    background-color: var(--pale-grey-four)
    border: 1px solid var(--light)
    padding: 0.75rem
    border-radius: var(--default-radius)
    margin-bottom: 0.25rem
    position: relative

  .disabled
    color: var(--light)

  .option .form-check-input
    right: 1rem
`)

export default Configure
