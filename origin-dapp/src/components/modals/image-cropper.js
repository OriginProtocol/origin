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

    this.defaultState = {
      imageFileObj: null,
      imageSrc: null,
      crop: this.defaultCrop,
      pixelCrop: null,
      croppedImage: null,
      croppedImageUrl: null
    }

    this.state = this.defaultState

    this.onCropChange = this.onCropChange.bind(this)
    this.onCropComplete = this.onCropComplete.bind(this)
  }

  componentDidUpdate(prevProps) {
    const { imageFileObj, aspect, isOpen } = this.props
    const imagePropChange = imageFileObj && imageFileObj !== prevProps.imageFileObj
    const newImage = imageFileObj && !this.state.imageSrc

    if (isOpen) {
      if (imagePropChange || newImage) {
        generateCroppedImage(imageFileObj, null, (dataUri) => {
          this.setState({
            imageSrc: dataUri,
            crop: this.defaultCrop,
            imageFileObj
          })
        })
      }

      if (aspect && aspect !== this.state.crop.aspect) {
        this.setState({
          crop: {
            ...this.state.crop,
            aspect: this.props.aspect
          }
        })
      }
    }

    if (!isOpen && prevProps.isOpen) {
      this.setState(this.defaultState)
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
