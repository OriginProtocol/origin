import React, { Component } from 'react'
import { FormattedMessage } from 'react-intl'
import ReactCrop from 'react-image-crop'
import { modifyImage } from 'utils/fileUtils'
import { saveStorageItem } from 'utils/localStorage'
import Modal from 'components/modal'

class ImageCropper extends Component {
  constructor(props) {
    super(props)

    this.state = {
      imageFileObj: null,
      imageSrc: null,
      crop: {
        x: 0,
        y: 0,
        width: 100,
        aspect: 4/3
      },
      pixelCrop: null,
      croppedImage: null,
      croppedImageUrl: null
    }

    this.onCropChange = this.onCropChange.bind(this)
    this.onCropComplete = this.onCropComplete.bind(this)
  }

  async componentDidUpdate(prevProps) {
    if (this.props.imageFileObj && this.props.imageFileObj !== prevProps.imageFileObj) {

      modifyImage(this.props.imageFileObj, {orientation: true, meta: true}, (dataUri) => {
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

  async onCropComplete() {
    const { imageFileObj, pixelCrop } = this.state

    const loadImageOptions = {
      maxWidth: pixelCrop.width,
      maxHeight: pixelCrop.height,
      aspectRatio: 4/3,
      left: pixelCrop.x,
      top: pixelCrop.y,
      orientation: true,
      crop: true,
      contain: true,
    }

    modifyImage(imageFileObj, loadImageOptions, (dataUri) => {
      this.props.onCropComplete(dataUri, imageFileObj)
    })
  }

  render() {
    const { imageSrc, crop } = this.state

    return (
      <Modal
        isOpen={!!this.props.isOpen}
        backdrop="static"
        data-modal="imageCropper"
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
