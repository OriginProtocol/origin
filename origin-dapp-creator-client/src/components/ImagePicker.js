'use strict'

import superagent from 'superagent'

import React from 'react'

const acceptedFileTypes = [
  'image/jpeg',
  'image/pjpeg',
  'image/png',
  'image/vnd.microsoft.icon',
  'image/x-icon',
  // Not valid but sometimes used for icons
  'image/ico',
  'image/icon'
]

class ImagePicker extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      imageUrl: this.props.imageUrl,
      loading: false,
      uploadError: null
    }

    this.handleFileChange = this.handleFileChange.bind(this)
    this.handleClearClick = this.handleClearClick.bind(this)
  }

  async handleFileChange(event) {
    const { target } = event
    const { files } = target

    this.setState({
      uploadError: null,
      loading: true
    })

    if (files && files[0]) {
      const file = files[0]

      if (acceptedFileTypes.indexOf(file.type) >= 0) {
        const body = new FormData()
        body.append('file', file)

        await superagent
          .post(`${process.env.IPFS_API_URL}/api/v0/add`)
          .send(body)
          .then(response => {
            const imageUrl = `${process.env.IPFS_API_URL}/ipfs/${
              response.body.Hash
            }`
            this.setState({ imageUrl: imageUrl })
            if (this.props.onUpload) {
              this.props.onUpload(this.props.name, imageUrl)
            }
          })
          .catch(error => {
            if (error.response) {
              if (error.response.status === 413) {
                this.setState({
                  uploadError:
                    'Image is too large, please choose something below 2mb.',
                  loading: false
                })
              } else if (error.response.status === 415) {
                this.setState({
                  uploadError: 'Image is an invalid type.',
                  loading: false
                })
              }
            } else {
              this.setState({
                uploadError: 'An error occurred uploading your image.',
                loading: false
              })
            }
          })
      } else {
        this.setState({
          uploadError:
            'That file type is not supported, please use JPEG or PNG.',
          loading: false
        })
      }
    }
  }

  handleClearClick() {
    this.setState({ data: null })
  }

  render() {
    return (
      <div className="image-picker-wrapper">
        <input
          id={this.props.name + '-picker'}
          className="form-control-file"
          type="file"
          accept={acceptedFileTypes}
          onChange={this.handleFileChange}
        />

        {this.state.imageUrl ? (
          this.renderPreview()
        ) : (
          <div className="image-picker" onClick={this.handlePreviewClick}>
            <div className="upload-wrapper">
              <img src="images/upload-icon.svg" />
              <p className="title">{this.props.title}</p>
              <p>
                Recommended Size: <br />
                {this.props.recommendedSize}
              </p>
            </div>
            <label
              htmlFor={this.props.name + '-picker'}
              className="btn btn-outline-primary"
              disabled={this.state.loading}
            >
              Upload
            </label>
          </div>
        )}

        {this.state.uploadError && (
          <div className="invalid-feedback">{this.state.uploadError}</div>
        )}
      </div>
    )
  }

  renderPreview() {
    return (
      <div className="preview">
        <div className="upload-wrapper">
          <img src={this.state.imageUrl} />
        </div>
        <label
          htmlFor={this.props.name + '-picker'}
          className="btn btn-outline-primary"
        >
          Change
        </label>
      </div>
    )
  }
}

require('react-styl')(`
  .image-picker-wrapper .invalid-feedback
    display: block

  .upload-wrapper
    position: relative
    background-color: var(--pale-grey-four)

  .image-picker, .preview
    text-align: center;

  .image-picker
    padding: 2rem
    border: 1px dashed var(--light)
    border-radius: var(--default-radius)
    background-color: var(--pale-grey-four)

  .image-picker img
    margin-bottom: 0.25rem

  .preview
    label
      margin-top: 2rem
    img
      max-width: 100%
      margin: auto

  .title
    color: var(--dark)
    font-size: 1.125rem

  .form-control-file
    width: 1px
    height: 1px
    opacity: 0
    position: absolute
    overflow: hidden
    z-index: -1
`)

export default ImagePicker
