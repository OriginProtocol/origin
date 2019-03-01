'use strict'

import React from 'react'
import superagent from 'superagent'
import { baseConfig } from 'origin-dapp/src/config'

import ColorPicker from 'components/ColorPicker'
import ImagePicker from 'components/ImagePicker'
import Preview from 'components/Preview'
import Redirect from 'components/Redirect'
import ThemePicker from 'components/ThemePicker'

class Customize extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      config: props.config,
      previewing: false,
      redirect: null,
      themes: [
        {
          title: 'Origin',
          cssVars: baseConfig.cssVars
        },
        {
          title: 'Eco Green',
          cssVars: {
            ...baseConfig.cssVars,
            dusk: '#3BA54E'
          }
        },
        {
          title: 'Royal Purple',
          cssVars: {
            ...baseConfig.cssVars,
            dusk: '#833AAB'
          }
        }
      ],
      themeIndex: 0,
      themePickerExpanded: false
    }

    this.handleFileUpload = this.handleFileUpload.bind(this)
    this.handlePreview = this.handlePreview.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
    this.onColorChange = this.onColorChange.bind(this)
    this.onThemePickerExpand = this.onThemePickerExpand.bind(this)
    this.onThemePickerCollapse = this.onThemePickerCollapse.bind(this)
    this.onThemeClick = this.onThemeClick.bind(this)
  }

  async handleSubmit() {
    this.props.onChange(this.state.config)
    this.setState({ redirect: '/configure' })
  }

  async handlePreview(event) {
    event.preventDefault()

    this.setState({ previewing: true })

    let response
    try {
      response = await superagent
        .post(`${process.env.DAPP_CREATOR_API_URL}/config/preview`)
        .send({ config: this.state.config })
    } catch (error) {
      console.log('An error occurred generating preview: ' + error)
      return
    } finally {
      this.setState({ previewing: false })
    }

    const ipfsPath = `${process.env.IPFS_GATEWAY_URL}/ipfs/${response.text}`
    window.open(`${process.env.DAPP_URL}/?config=${ipfsPath}`, '_blank')
  }

  onColorChange(name, color) {
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

  handleFileUpload(name, url) {
    const newConfig = {
      ...this.state.config,
      [name]: url
    }

    this.props.onChange(newConfig)
    this.setState({ config: newConfig })
  }

  onThemePickerExpand() {
    this.setState({ themePickerExpanded: true })
  }

  onThemePickerCollapse() {
    this.setState({ themePickerExpanded: false })
  }

  onThemeClick(index) {
    const newConfig = {
      ...this.state.config,
      cssVars: {
        ...this.state.config.cssVars,
        ...this.state.themes[index].cssVars
      }
    }

    this.props.onChange(newConfig)
    this.setState({
      config: newConfig,
      themeIndex: index
    })

    this.onThemePickerCollapse()
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        {this.renderRedirect()}

        <h1>Customize Your Marketplace&apos;s Appearance</h1>
        <h4>Choose a logo and colors for your marketplace below.</h4>

        <div className="form-group">
          <div className="row">
            <div className="col-6">
              <ImagePicker
                title="Marketplace Logo"
                name="logoUrl"
                recommendedSize={'300px x 100px'}
                onUpload={this.handleFileUpload}
                imageUrl={this.props.config.logoUrl}
              />
            </div>

            <div className="col-6">
              <ImagePicker
                title="Marketplace Favicon"
                name="faviconUrl"
                recommendedSize={'16px x 16px'}
                onUpload={this.handleFileUpload}
                imageUrl={this.props.config.faviconUrl}
              />
            </div>
          </div>
        </div>

        <div className="form-group">
          <label>Select Theme</label>
          <ThemePicker
            config={this.props.config}
            themes={this.state.themes}
            themeIndex={this.state.themeIndex}
            onThemeClick={this.onThemeClick}
            onCollapse={this.onThemePickerCollapse}
            onExpand={this.onThemePickerExpand}
            expanded={this.state.themePickerExpanded}
          />
        </div>

        {!this.state.themePickerExpanded && (
          <div className="form-group">
            <p>You can further customize your colors.</p>
            <div className="row">
              <div className="col-7">
                <Preview config={this.state.config} rows={3} />
              </div>

              <div className="col-5">
                <label className="colors-label">Colors</label>
                <ColorPicker
                  description="Navbar Background"
                  name="dusk"
                  config={this.state.config.cssVars}
                  onChange={this.onColorChange}
                />
                <ColorPicker
                  description="Search Background"
                  name="paleGrey"
                  config={this.state.config.cssVars}
                  onChange={this.onColorChange}
                />
                <ColorPicker
                  description="Featured Tag"
                  name="goldenRod"
                  config={this.state.config.cssVars}
                  onChange={this.onColorChange}
                />
                <ColorPicker
                  description="Footer Color"
                  name="lightFooter"
                  config={this.state.config.cssVars}
                  onChange={this.onColorChange}
                />
                <ColorPicker
                  description="Font Color"
                  name="dark"
                  config={this.state.config.cssVars}
                  onChange={this.onColorChange}
                />
              </div>
            </div>
          </div>
        )}

        <div className="form-group">
          <div className="actions">
            <a href="#" onClick={this.handlePreview}>
              Preview Appearance
            </a>
          </div>
        </div>

        <div className="form-actions clearfix">
          <button
            onClick={() => this.setState({ redirect: '/' })}
            className="btn btn-outline-primary btn-lg btn-left"
          >
            Back
          </button>

          <button type="submit" className="btn btn-primary btn-lg btn-right">
            Continue
          </button>
        </div>
      </form>
    )
  }

  renderRedirect() {
    if (this.state.redirect !== null) {
      return <Redirect to={this.state.redirect} />
    }
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

  .theme-actions
    cursor: pointer
`)

export default Customize
