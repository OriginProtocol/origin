import React, { Component, Fragment } from 'react'
import { FormattedMessage } from 'react-intl'
import ReactCrop from 'react-image-crop'
import { getDataUri, generateCroppedImage } from 'utils/fileUtils'
import Modal from 'components/modal'

class ImageCropper extends Component {
  constructor(props) {
    super(props)

    this.state = {
      isOpen: false,
      imageFileObj: null,
      imageSrc: null,
      crop: {
        x: 5,
        y: 5,
        width: 90,
        aspect: 4/3
      },
      pixelCrop: null,
      croppedImage: null,
      croppedImageUrl: null
    }

    this.onCropChange = this.onCropChange.bind(this)
    this.onCropComplete = this.onCropComplete.bind(this)
  }

  async componentDidMount() {
    const imageSrc = await getDataUri(this.props.imageFileObj)
    this.setState({
      imageSrc,
      ...this.props
    })
  }

  onCropChange(crop, pixelCrop) {
    this.setState({
      crop,
      pixelCrop
    })
  }

  async onCropComplete() {
    const { imageFileObj, pixelCrop } = this.state
    const croppedImageFile = await generateCroppedImage(imageFileObj, pixelCrop)
    const croppedImageUri = await getDataUri(croppedImageFile)
    this.props.onCropComplete(croppedImageUri, imageFileObj)
  }

  render() {
    const { isOpen, imageSrc, crop } = this.state

    return (
      <Fragment>
        <Modal
          isOpen={isOpen}
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
      </Fragment>
    )
  }
}

export default ImageCropper
