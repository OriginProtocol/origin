import React, { Component } from 'react'
import { FormattedMessage } from 'react-intl'
import ReactCrop from 'react-image-crop'
import { getDataUri, generateCroppedImage } from 'utils/fileUtils'
import Modal from 'components/modal'

const rotation = {
  1: 'rotate(0deg)',
  3: 'rotate(180deg)',
  6: 'rotate(90deg)',
  8: 'rotate(270deg)'
};

async function getOrientation(file, callback) {
  const reader = new FileReader()

  reader.onload = function(event) {
    const view = new DataView(event.target.result)
    if (view.getUint16(0, false) != 0xFFD8) return callback(-2)

    const length = view.byteLength

    let offset = 2

    while (offset < length) {
      const marker = view.getUint16(offset, false)
      offset += 2

      if (marker == 0xFFE1) {
        if (view.getUint32(offset += 2, false) != 0x45786966) {
          return callback(-1)
        }
        const little = view.getUint16(offset += 6, false) == 0x4949
        offset += view.getUint32(offset + 4, little)
        const tags = view.getUint16(offset, little)
        offset += 2

        for (var i = 0; i < tags; i++) {
          if (view.getUint16(offset + (i * 12), little) == 0x0112) {
            return callback(view.getUint16(offset + (i * 12) + 8, little))
          }
        }
      }
      else if ((marker & 0xFF00) != 0xFF00) break
      else offset += view.getUint16(offset, false)
    }
    return callback(-1)
  }

  reader.readAsArrayBuffer(file.slice(0, 64 * 1024))
}


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
      const imageSrc = await getDataUri(this.props.imageFileObj)
      this.setState({
        imageSrc,
        ...this.props
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

    let profile_photo_orientation
    const orientation =  await getOrientation(imageFileObj, function(orientation) {
      const positiveOrientation = orientation < 0 ? orientation * -1 : orientation
      profile_photo_orientation = rotation[positiveOrientation]
    })

    const croppedImageFile = await generateCroppedImage(imageFileObj, pixelCrop)
    const croppedImageUri = await getDataUri(croppedImageFile)

    this.props.onCropComplete(croppedImageUri, profile_photo_orientation, imageFileObj)
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
