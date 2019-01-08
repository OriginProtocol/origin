import React from 'react'
import superagent from 'superagent'

import { AppToaster } from '../toaster'
import { formInput, formFeedback } from 'utils/formHelpers'
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
              <ImagePicker />
            </div>

            <div className="col-6">
              <ImagePicker />
            </div>
          </div>

          <div className="form-group">
            <label>Theme</label>
            <select className="form-control form-control-lg">
              <option>Matt Dreams of Poultry</option>
            </select>
          </div>

          <div className="row">
            <div className="col-8">
            </div>

            <div className="col-4">
              <label>Colors</label>
              <br/>
              <label>Font</label>
            </div>
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

export default Customize
