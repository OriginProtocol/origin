import React from 'react'
import superagent from 'superagent'

import { AppToaster } from '../toaster'
import { formInput, formFeedback } from 'utils/formHelpers'
import ColorPicker from 'components/ColorPicker'
import ImagePicker from 'components/ImagePicker'
import Preview from 'components/Preview'
import Redirect from 'components/Redirect'

class Customize extends React.Component {
  constructor(props, context) {
    super(props)

    this.state = {
      config: props.config,
      previewing: false
    }

    this.handlePreview = this.handlePreview.bind(this)
    this.onColorChange = this.onColorChange.bind(this)
  }

  async handleSubmit (event) {
  }

  handlePreview (event) {
    event.preventDefault()

    this.setState({ previewing: true })

    let response
    try {
      response = superagent
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

  onColorChange (name, color) {
    const newConfig = {
      ...this.state.config,
      cssVars: {
        ...this.state.config.cssVars,
        [name]: color.hex
      }
    }

    this.props.onChange(newConfig)

    this.setState({ config: newConfig })
  }

  render () {
    const input = formInput(this.state, state => this.setState(state))
    const Feedback = formFeedback(this.state)

    return (
      <>
        <form onSubmit={this.handleSubmit}>
          <h1>Customize your Marketplace's Appearance</h1>
          <h4>Choose a logo and colors for your marketplace below.</h4>

          <div className="form-group">
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
          </div>

          <div className="form-group">
            <label>Theme</label>
            <select className="form-control form-control-lg">
              <option>Matt Dreams of Poultry</option>
            </select>
          </div>

          <div className="form-group">
            <div className="row">
              <div className="col-7">
                <Preview config={this.state.config} />
              </div>

              <div className="col-5">
                <label className="colors-label">Colors</label>
                <ColorPicker description="Navbar Background"
                  name="dusk"
                  config={this.state.config.cssVars}
                  onChange={this.onColorChange} />
                <ColorPicker description="Search Background"
                  name="paleGrey"
                  config={this.state.config.cssVars}
                  onChange={this.onColorChange} />
                <ColorPicker description="Featured Tag"
                  name="goldenRod"
                  config={this.state.config.cssVars}
                  onChange={this.onColorChange} />
                <ColorPicker description="Footer Color"
                  name="dark"
                  config={this.state.config.cssVars}
                  onChange={this.onColorChange} />
              </div>
            </div>
          </div>

          <div className="form-group">
            <div className="actions">
              <a href="#" onClick={this.handlePreview}>
                Preview Appearance
              </a>
            </div>
          </div>

          <div className="form-actions clearfix">
            <button className="btn btn-outline-primary btn-lg btn-left">
              Back
            </button>

            <button type="submit" className="btn btn-primary btn-lg btn-right">
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
    background-color: var(--pale-grey-four)
    border: 1px solid var(--light)
    text-align: center
    padding: 0.75rem
  .colors-label
    margin-top: -0.25rem
`)

export default Customize
