import React, { Component } from 'react'
import { FormattedMessage, defineMessages, injectIntl } from 'react-intl'
import { getDataUri } from 'utils/fileUtils'

const MAX_IMAGE_BYTES = 2000000 // 2MB
const MAX_IMAGE_MB = MAX_IMAGE_BYTES / 1000000

class PhotoPicker extends Component {
  constructor(props) {
    super(props)
    this.state = {
      pictures: [],
      oversizeImages: []
    }

    this.intlMessages = defineMessages({
      macHelpText: {
        id: 'photo-picker.macHelpText',
        defaultMessage: 'Hold down "command" (⌘) to select multiple images'
      },
      iosHelpText: {
        id: 'photo-picker.iosHelpText',
        defaultMessage: 'Select multiple images to upload them all at once'
      },
      windowsHelpText: {
        id: 'photo-picker.windowsHelpText',
        defaultMessage: 'Hold down "Ctrl" to select multiple images'
      },
      androidHelpText: {
        id: 'photo-picker.androidHelpText',
        defaultMessage: 'Select multiple images to upload them all at once'
      },
      linuxHelpText: {
        id: 'photo-picker.linuxHelpText',
        defaultMessage: 'Hold down "Ctrl" to select multiple images'
      },
      confirmRemoveImage: {
        id: 'photo-picker.confirmRemoveImage',
        defaultMessage: 'Are you sure you want to de-select this photo?'
      }
    })

    this.onChange = this.onChange.bind(this)
    this.setHelpText = this.setHelpText.bind(this)
  }

  componentDidMount() {
    this.setHelpText()
  }

  setHelpText() {
    const { intl } = this.props
    const userAgent = window.navigator.userAgent
    const platform = window.navigator.platform
    const macosPlatforms = ['Macintosh', 'MacIntel', 'MacPPC', 'Mac68K']
    const windowsPlatforms = ['Win32', 'Win64', 'Windows', 'WinCE']
    const iosPlatforms = ['iPhone', 'iPad', 'iPod']
    let helpText = ''

    if (macosPlatforms.indexOf(platform) !== -1) {
      helpText = intl.formatMessage(this.intlMessages.macHelpText)
    } else if (iosPlatforms.indexOf(platform) !== -1) {
      helpText = intl.formatMessage(this.intlMessages.iosHelpText)
    } else if (windowsPlatforms.indexOf(platform) !== -1) {
      helpText = intl.formatMessage(this.intlMessages.windowsHelpText)
    } else if (/Android/.test(userAgent)) {
      helpText = intl.formatMessage(this.intlMessages.androidHelpText)
    } else if (!helpText && /Linux/.test(platform)) {
      helpText = intl.formatMessage(this.intlMessages.linuxHelpText)
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

      const oversizeImages = []
      for (let i = filesArr.length - 1; i >= 0; --i) {
        const thisImage = filesArr[i]
        if (thisImage.size > MAX_IMAGE_BYTES) {
          oversizeImages.push(thisImage)
          filesArr.splice(i, 1)
        }
      }

      if (oversizeImages.length) {
        this.setState({
          oversizeImages
        })
      }

      const filesAsDataUriArray = filesArr.map(async fileObj => getDataUri(fileObj))

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

  removePhoto(indexToRemove) {
    const confirmation = window.confirm(this.props.intl.formatMessage(this.intlMessages.confirmRemoveImage))
    if (confirmation) {
      this.setState({
        pictures: this.state.pictures.filter((picture, idx) => idx !== indexToRemove)
      })
    }
  }

  removeWarning(indexToRemove) {
    this.setState({
      oversizeImages: this.state.oversizeImages.filter((warning, idx) => idx !== indexToRemove)
    })
  }

  render() {
    const { schema, required } = this.props
    const { helpText, oversizeImages, pictures } = this.state

    return (
      <div className="photo-picker">
        <label className="photo-picker-container" htmlFor="photo-picker-input">
          <img
            className="camera-icon"
            src="images/camera-icon.svg"
            role="presentation"
          />
          <br />
          <span>{schema.title}</span>
          <br />
        </label>
        <input
          id="photo-picker-input"
          type="file"
          accept="image/jpeg,image/gif,image/png"
          visibility="hidden"
          onChange={this.onChange()}
          required={required}
          multiple
        />
        {helpText && (
          <p className="help-block">{helpText}</p>
        )}
        <p className="help-block">
          <FormattedMessage
            id={'photo-picker.listingSize'}
            defaultMessage={
              'Images may not exceed {maxImageMB}MB each'
            }
            values={{ maxImageMB: MAX_IMAGE_MB }}
          />
        </p>
        <div className="d-flex pictures">
          {oversizeImages.map((imgObj, idx) => (
            <div className="info-box warn" key={imgObj.name}>
              <img className="close-btn" src="images/close-icon.svg" onClick={() => this.removeWarning(idx)} />
              <p>
                <FormattedMessage
                  id={'photo-picker.oversizeImages'}
                  defaultMessage={
                    'Your selected image, {imageName}, is too large. Max allowed size is {maxImageMB}MB'
                  }
                  values={{
                    imageName: <strong>{imgObj.name}</strong>,
                    maxImageMB: MAX_IMAGE_MB
                  }}
                />
              </p>
            </div>
          ))}
        </div>
        <div className="d-flex pictures">
          {pictures.map((dataUri, idx) => (
            <div className="image-container" key={idx}>
              <img className="close-btn" src="images/close-icon.svg" onClick={() => this.removePhoto(idx)} />
              <img className="preview-thumbnail" src={dataUri} />
            </div>
          ))}
        </div>
      </div>
    )
  }
}

export default injectIntl(PhotoPicker)
