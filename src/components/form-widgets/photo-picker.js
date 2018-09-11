import React, { Component } from 'react'

import { getDataUri } from 'utils/fileUtils'

class PhotoPicker extends Component {
  constructor(props) {
    super(props)
    this.state = {
      pictures: []
    }

    this.onChange = this.onChange.bind(this)
  }

  componentDidMount() {
    this.setHelpText()
  }

  setHelpText() {
    const userAgent = window.navigator.userAgent
    const platform = window.navigator.platform
    const macosPlatforms = ['Macintosh', 'MacIntel', 'MacPPC', 'Mac68K']
    const windowsPlatforms = ['Win32', 'Win64', 'Windows', 'WinCE']
    const iosPlatforms = ['iPhone', 'iPad', 'iPod']
    let helpText = ''

    if (macosPlatforms.indexOf(platform) !== -1) {
      helpText = 'Hold down "command" (⌘) to select multiple images'
    } else if (iosPlatforms.indexOf(platform) !== -1) {
      helpText = 'Select multiple images to upload them all at once'
    } else if (windowsPlatforms.indexOf(platform) !== -1) {
      helpText = 'Hold down "Ctrl" to select multiple images'
    } else if (/Android/.test(userAgent)) {
      helpText = 'Select multiple images to upload them all at once'
    } else if (!helpText && /Linux/.test(platform)) {
      helpText = 'Hold down "Ctrl" to select multiple images'
    }

    this.setState({ helpText })
  }

  onChange() {
    return async event => {
      const filesObj = event.target.files
      const filesArr = []
      for (const key in filesObj) {
        if (filesObj.hasOwnProperty(key)) {
          filesArr.push(filesObj[key])
        }
      }

      const filesAsDataUriArray = filesArr.map(async getDataUri)

      Promise.all(filesAsDataUriArray).then(dataUriArray => {
        this.setState(
          {
            pictures: dataUriArray
          },
          () => this.props.onChange(dataUriArray)
        )
      })
    }
  }

  render() {
    return (
      <div className="photo-picker">
        <label className="photo-picker-container" htmlFor="photo-picker-input">
          <img
            className="camera-icon"
            src="images/camera-icon.svg"
            role="presentation"
          />
          <br />
          <span>{this.props.schema.title}</span>
          <br />
        </label>
        <input
          id="photo-picker-input"
          type="file"
          accept="image/jpeg,image/gif,image/png"
          visibility="hidden"
          onChange={this.onChange()}
          required={this.props.required}
          multiple
        />
        {this.state.helpText && (
          <p className="help-block">{this.state.helpText}</p>
        )}
        <div className="d-flex pictures">
          {this.state.pictures.map((dataUri, idx) => (
            <div className="image-container" key={idx}>
              <img className="preview-thumbnail" src={dataUri} />
            </div>
          ))}
        </div>
      </div>
    )
  }
}

export default PhotoPicker
