import React, { Component, Fragment } from 'react'
import { FormattedMessage } from 'react-intl'
import ReactCrop from 'react-image-crop'
import { getDataUri } from 'utils/fileUtils'
import Modal from 'components/modal'

const MAX_IMAGE_WIDTH = 1000
const MAX_IMAGE_HEIGHT = 1000

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
    this.generateCroppedImage = this.generateCroppedImage.bind(this)
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
    const croppedImageFile = await this.generateCroppedImage()
    const croppedImageUri = await getDataUri(croppedImageFile)
    this.props.onCropComplete(croppedImageUri)
  }

  generateCroppedImage() { 
    const { pixelCrop, imageFileObj, imageSrc } = this.state
    let image
    let canvas
    
    function drawImageOnCanvas(imgEl) {
      const defaultConfig = {
        x: 0,
        y: 0,
        width: imgEl.width,
        height: imgEl.height
      }

      const { x, y, width, height } = pixelCrop || defaultConfig

      let resizedWidth = width
      let resizedHeight = height

      if (width > MAX_IMAGE_WIDTH) {
        resizedWidth = MAX_IMAGE_WIDTH
        const widthDiffRatio = resizedWidth / width
        resizedHeight = height * widthDiffRatio
      }

      if (resizedHeight > MAX_IMAGE_HEIGHT) {
        const heightDiffRatio = MAX_IMAGE_HEIGHT / resizedHeight
        resizedHeight = MAX_IMAGE_HEIGHT
        resizedWidth = resizedWidth * heightDiffRatio
      }

      canvas = document.createElement('canvas')
      canvas.width = resizedWidth
      canvas.height = resizedHeight
      const ctx = canvas.getContext('2d')

      ctx.drawImage(
        image,
        x,
        y,
        width,
        height,
        0,
        0,
        resizedWidth,
        resizedHeight
      )
    }
   
    return new Promise((resolve) => {
      image = new Image()
      image.onload = () => {
        drawImageOnCanvas(image)
        canvas.toBlob(file => {
          file.name = imageFileObj.name
          resolve(file)
        }, 'image/jpeg')
      }
      image.src = imageSrc
    })
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
