import React from 'react'
import superagent from 'superagent'

import { AppToaster } from '../toaster'
import { formInput, formFeedback } from 'utils/formHelpers'
import ColorPicker from 'components/ColorPicker'
import ImagePicker from 'components/ImagePicker'
import Redirect from 'components/Redirect'

class Customize extends React.Component {
  constructor(props, context) {
    super(props)

    this.themes = {
    }
  }

  async handleSubmit (event) {
  }

  async handlePreview () {
    this.setState({ previewing: true })

    let response
    try {
      response = await superagent
        .post(`${process.env.DAPP_CREATOR_API_URL}/config/preview`)
        .send({ config: this.state.config })
    } catch(error) {
      console.log('An error occurred generating preview: ' + error)
      return
    } finally {
      this.setState({ previewing: false })
    }

    const ipfsPath = `${process.env.IPFS_GATEWAY_URL}/ipfs/${response.text}`
    window.open(`${process.env.DAPP_URL}/?config=${ipfsPath}`, '_blank')
  }

  render () {
    const input = formInput(this.state, state => this.setState(state))
    const Feedback = formFeedback(this.state)

    return (
      <>
        <form onSubmit={this.handleSubmit}>
          <h1>Customize your Marketplace's Appearance</h1>
          <h4>Choose a logo and colors for your marketplace below.</h4>

          <div className="row">
            <div className="col-6">
              <ImagePicker title="Marketplace Logo"
                description="Recommended Size: 300px x 100px"/>
            </div>

            <div className="col-6">
              <ImagePicker title="Marketplace Favicon"
                description="Recommended Size: 16px x 16px" />
            </div>
          </div>

          <div className="form-group">
            <label>Theme</label>
            <select className="form-control form-control-lg">
              <option>Matt Dreams of Poultry</option>
            </select>
          </div>

          <div className="row">
            <div className="col-7">
            </div>

            <div className="col-5">
              <label>Colors</label>
              <ColorPicker description="Navbar Background" />
              <ColorPicker description="Search Background" />
              <ColorPicker description="Featured Tag" />
              <ColorPicker description="Footer Color" />
            </div>
          </div>

          <div class="actions">
            <a href="#" onClick={this.handlePreview}>
              Preview Appearance
            </a>
          </div>

          <div className="form-actions">
            <button className="btn btn-outline-primary btn-lg">
              Back
            </button>

            <button type="submit" className="btn btn-primary btn-lg">
              Continue
            </button>
          </div>
        </form>
      </>
    )
  }
}

require('react-styl')(`
  .actions
    margin-top: 1rem
    background-color: var(--pale-grey-four)
    border: 1px solid var(--light)
    text-align: center
    padding: 0.75rem
`)

export default Customize
