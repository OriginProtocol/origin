import React, { Component } from 'react'
import { FormattedMessage } from 'react-intl'
import ReactCrop from 'react-image-crop'
import { generateCroppedImage } from 'utils/fileUtils'
import Modal from 'components/modal'

class ImageCropper extends Component {
  constructor(props) {
    super(props)

    this.defaultCrop = {
      x: 0,
      y: 0,
      width: 100,
      aspect: 4/3
    }

    this.state = {
      imageFileObj: null,
      imageSrc: null,
      crop: this.defaultCrop,
      pixelCrop: null,
      croppedImage: null,
      croppedImageUrl: null
    }

    this.onCropChange = this.onCropChange.bind(this)
    this.onCropComplete = this.onCropComplete.bind(this)
  }

  componentDidUpdate(prevProps) {
    const { imageFileObj } = this.props
    if (imageFileObj && imageFileObj !== prevProps.imageFileObj) {

      generateCroppedImage(imageFileObj, null, (dataUri) => {
        this.setState({
          imageSrc: dataUri,
          ...this.props
        })
      })
    }

    if (this.props.aspect && this.props.aspect !== this.state.crop.aspect) {
      this.setState({
        crop: {
          ...this.state.crop,
          aspect: this.props.aspect
        }
      })
    }
  }

  onCropChange(crop, pixelCrop) {
    this.setState({
      crop,
      pixelCrop
    })
  }

  onCropComplete() {
    const { imageFileObj, pixelCrop, crop = {} } = this.state

    const options = {
      ...pixelCrop,
      aspectRatio: crop.aspect,
    }
    generateCroppedImage(imageFileObj, options, (croppedImageUri) => {
      this.props.onCropComplete(croppedImageUri, imageFileObj)
      this.setState({
        crop: this.defaultCrop,
        imageSrc: null
      })
    })
  }

  render() {
    const { imageSrc, crop } = this.state

    return (
      <Modal
        isOpen={!!this.props.isOpen}
        backdrop="static"
        className="imageCropper"
        alignItems="center"
      >
        {imageSrc &&
          <ReactCrop
            src={imageSrc}
            crop={crop}
            onChange={this.onCropChange}
          />
        }
        <div className="button-container d-flex justify-content-center">
          <button
            type="button"
            className="btn btn-clear"
            onClick={this.onCropComplete}
          >
            <FormattedMessage
              id={'image-cropper.continue'}
              defaultMessage={'Continue'}
            />
          </button>
        </div>
        <div className="link-container text-center">
          <a onClick={() => this.props.onCropCancel()}>
            <FormattedMessage
              id={'image-cropper.cancel'}
              defaultMessage={'Cancel'}
            />
          </a>
        </div>
      </Modal>
    )
  }
}

export default ImageCropper
