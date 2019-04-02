import React, { Component } from 'react'
import ReactCrop from 'react-image-crop'
import loadImage from 'utils/loadImage'
import { fbt } from 'fbt-runtime'

import Modal from 'components/Modal'

class ImageCropper extends Component {
  state = {
    src: null,
    didCrop: false,
    crop: { aspect: 1, width: 100, height: 100 }
  }

  onSelectFile(e) {
    if (e.target.files && e.target.files.length > 0) {
      loadImage(
        e.target.files[0],
        img => this.setState({ src: img.toDataURL('image/jpeg'), open: true }),
        {
          orientation: true,
          maxWidth: 250,
          maxHeight: 250
        }
      )
    }
  }

  getCroppedImg() {
    const { pixelCrop } = this.state
    const canvas = document.createElement('canvas')
    canvas.width = pixelCrop.width
    canvas.height = pixelCrop.height
    const ctx = canvas.getContext('2d')

    ctx.drawImage(
      this.imageRef,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    )

    return canvas.toDataURL('image/jpeg')
  }

  render() {
    return (
      <>
        <label htmlFor="upload" className="image-cropper">
          {this.state.open ? null : (
            <input
              id="upload"
              type="file"
              onChange={e => this.onSelectFile(e)}
              style={{ display: 'none' }}
            />
          )}
          {this.props.children}
        </label>

        {this.state.open && (
          <Modal
            shouldClose={this.state.shouldClose}
            onClose={() => this.setState({ open: false, shouldClose: false })}
            className="image-cropper-modal"
          >
            <h5>Crop</h5>
            <div className="crop-container">
              <div className="image-wrap">
                <ReactCrop
                  src={this.state.src}
                  crop={this.state.crop}
                  onImageLoaded={image => {
                    this.imageRef = image
                    this.setState({
                      pixelCrop: {
                        x: 0,
                        y: 0,
                        width: image.naturalWidth,
                        height: image.naturalHeight
                      },
                      crop: {
                        x: 0,
                        y: 0,
                        width: 100,
                        height: 100,
                        aspect: 1
                      },
                      didCrop: true
                    })
                  }}
                  onChange={(crop, pixelCrop) => {
                    this.setState({ crop, pixelCrop, didCrop: true })
                  }}
                />
              </div>
              <div className="help-text">Click and drag to crop</div>
              <div className="actions">
                <button
                  className="btn btn-outline-light"
                  onClick={() => this.setState({ shouldClose: true })}
                  children={fbt('Cancel', 'Cancel')}
                />
                <button
                  className="btn btn-outline-light"
                  onClick={async () => {
                    const croppedImageUrl = await this.getCroppedImg()
                    this.props.onChange(croppedImageUrl)
                    this.setState({ shouldClose: true })
                  }}
                  children={fbt('OK', 'OK')}
                />
              </div>
            </div>
          </Modal>
        )}
      </>
    )
  }
}

export default ImageCropper

require('react-styl')(`
  .image-cropper
    cursor: pointer
    display: block
  .image-cropper-modal
    h5
      margin-bottom: 1rem
    .crop-container
      display: flex
      flex-direction: column
      align-items: center
      .image-wrap
        width: 200px
        height: 200px
    .help-text
      font-size: 14px
      margin-top: 1rem
`)
