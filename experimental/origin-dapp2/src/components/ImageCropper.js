import React, { Component } from 'react'
import ReactCrop from 'react-image-crop'

import Modal from 'components/Modal'

class ImageCropper extends Component {
  state = {
    src: null,
    didCrop: false,
    crop: { aspect: 1 }
  }

  onSelectFile(e) {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader()
      reader.addEventListener('load', () => {
        this.setState({ src: reader.result, open: true })
      })
      reader.readAsDataURL(e.target.files[0])
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

    return new Promise(resolve => {
      canvas.toBlob(blob => {
        blob.name = 'image.jpeg'
        window.URL.revokeObjectURL(this.fileUrl)
        this.fileUrl = window.URL.createObjectURL(blob)
        resolve(this.fileUrl)
      }, 'image/jpeg')
    })
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
          >
            <div className="d-flex flex-column">
              <div style={{ width: 200, height: 200 }}>
                <ReactCrop
                  src={this.state.src}
                  crop={this.state.crop}
                  onImageLoaded={image => (this.imageRef = image)}
                  onChange={(crop, pixelCrop) =>
                    this.setState({ crop, pixelCrop, didCrop: true })
                  }
                />
              </div>
              <button
                className="btn btn-outline-light"
                onClick={async () => {
                  if (this.state.didCrop) {
                    const croppedImageUrl = await this.getCroppedImg()
                    this.props.onChange(croppedImageUrl)
                  } else {
                    this.props.onChange(this.state.src)
                  }
                  this.setState({ shouldClose: true })
                }}
                children="OK"
              />
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
`)
