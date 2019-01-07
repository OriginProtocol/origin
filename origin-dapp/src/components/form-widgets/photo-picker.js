import React, { Component, Fragment } from 'react'
import { FormattedMessage, defineMessages, injectIntl } from 'react-intl'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import ImageCropper from '../modals/image-cropper'
import { generateCroppedImage, getDataURIsFromImgURLs, picURIsOnly } from 'utils/fileUtils'

const MAX_IMAGE_COUNT = 10

class PhotoPicker extends Component {
  constructor(props) {
    super(props)
    this.state = {
      imageFileObj: null,
      showCropModal: false,
      pictures: props.value,
      showMaxImageCountMsg: false,
      reCropImgIndex: null
    }

    this.intlMessages = defineMessages({
      reCropImage: {
        id: 'photo-picker.reCropImage',
        defaultMessage: 'Re-Crop Image'
      },
      deleteImage: {
        id: 'photo-picker.deleteImage',
        defaultMessage: 'Delete Image'
      },
      macHelpText: {
        id: 'photo-picker.macHelpText',
        defaultMessage: 'Hold down "command" (⌘) to select multiple images.'
      },
      iosHelpText: {
        id: 'photo-picker.iosHelpText',
        defaultMessage: 'Select multiple images to upload them all at once.'
      },
      windowsHelpText: {
        id: 'photo-picker.windowsHelpText',
        defaultMessage: 'Hold down "Ctrl" to select multiple images.'
      },
      androidHelpText: {
        id: 'photo-picker.androidHelpText',
        defaultMessage: 'Select multiple images to upload them all at once.'
      },
      linuxHelpText: {
        id: 'photo-picker.linuxHelpText',
        defaultMessage: 'Hold down "Ctrl" to select multiple images.'
      }
    })

    this.onFileSelected = this.onFileSelected.bind(this)
    this.reCropImage = this.reCropImage.bind(this)
    this.onCropComplete = this.onCropComplete.bind(this)
    this.onCropCancel = this.onCropCancel.bind(this)
    this.onDragEnd = this.onDragEnd.bind(this)
    this.setHelpText = this.setHelpText.bind(this)
  }

  componentDidMount() {
    this.setHelpText()

    // If a pictures array is passed in, we must call the onChange callback
    // to set the pictures array in the parent form
    // Unfortunately, the setTimeout is needed to allow the parent
    // form to render and be ready to handle the onChange event
    const { pictures } = this.state
    if (pictures) {
      setTimeout(async () => {
        const picDataURIs = await getDataURIsFromImgURLs(pictures)
        this.props.onChange(picDataURIs)
      })
    }
  }

  onFileSelected(e) {
    if (e.target.files && e.target.files.length > 0) {
      const imageFiles = e.target.files
      const pictures = [...this.state.pictures]

      for (const key in imageFiles) {
        if (imageFiles.hasOwnProperty(key)) {
          const file = imageFiles[key]

          generateCroppedImage(file, { aspectRatio: 4/3, centerCrop: true }, (dataUri) => {
            pictures.push({
              originalImageFile: file,
              croppedImageUri: dataUri
            })

            this.setState(
              { pictures },
              () => this.props.onChange(picURIsOnly(pictures))
            )
          })
        }
      }
    }
  }

  reCropImage(picObj, idx) {
    this.setState({
      imageFileObj: picObj.originalImageFile,
      showCropModal: true,
      reCropImgIndex: idx
    })
  }

  onCropComplete(croppedImageUri, imageFileObj) {
    let showMaxImageCountMsg = false
    const imgInput = document.getElementById('photo-picker-input')
    const pictures = this.state.pictures

    pictures[this.state.reCropImgIndex] = {
      originalImageFile: imageFileObj,
      croppedImageUri
    }

    if (pictures.length >= MAX_IMAGE_COUNT) {
      showMaxImageCountMsg = true
    }

    this.setState(
      {
        pictures,
        showMaxImageCountMsg,
        showCropModal: false,
      },
      () => this.props.onChange(picURIsOnly(pictures))
    )

    imgInput.value = null
  }

  onCropCancel() {
    this.setState({ showCropModal: false })
  }

  removePhoto(indexToRemove) {
    const pictures = this.state.pictures.filter(
      (picture, idx) => idx !== indexToRemove
    )

    this.setState(
      {
        pictures,
        showMaxImageCountMsg: false
      },
      () => this.props.onChange(picURIsOnly(pictures))
    )
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

  onDragEnd(result) {
    if (!result.destination) {
      return
    }

    const { pictures } = this.state
    const draggedItemIdx = result.source.index
    const destinationIdx = result.destination.index
    const reordered = Array.from(pictures)
    const [removed] = reordered.splice(draggedItemIdx, 1)
    reordered.splice(destinationIdx, 0, removed)

    this.setState(
      {
        pictures: reordered
      },
      () => this.props.onChange(reordered)
    )
  }

  render() {
    const { schema, required } = this.props
    const {
      pictures,
      showMaxImageCountMsg,
      showCropModal,
      imageFileObj,
      helpText
    } = this.state

    return (
      <Fragment>
        <ImageCropper
          isOpen={showCropModal}
          imageFileObj={imageFileObj}
          onCropComplete={this.onCropComplete}
          onCropCancel={this.onCropCancel}
        />
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
            onChange={this.onFileSelected}
            required={required}
            multiple
          />
          <p className="help-block">
            {helpText &&
              <Fragment>
                <span>{helpText}</span>
                <br/>
              </Fragment>
            }
            <FormattedMessage
              id={'photo-picker.listingSize'}
              defaultMessage={
                'Maximum {maxImageCount} images per listing.'
              }
              values={{
                maxImageCount: MAX_IMAGE_COUNT
              }}
            />
            <br/>
            <FormattedMessage
              id={'photo-picker.featuredImageExplainer'}
              defaultMessage={
                'First image will be featured - drag and drop images to reorder.'
              }
              values={{
                maxImageCount: MAX_IMAGE_COUNT
              }}
            />
            <br/>
            <FormattedMessage
              id={'photo-picker.featuredImageAspectRatio'}
              defaultMessage={
                'Recommended aspect ratio is 4:3'
              }
            />
          </p>
          <div className="d-flex pictures">
            {showMaxImageCountMsg && (
              <div className="info-box warn">
                <p>
                  <FormattedMessage
                    id={'photo-picker.maxImgCountMsg'}
                    defaultMessage={
                      'You have reached the upload limit of {maxImageCount} images per listing.'
                    }
                    values={{
                      maxImageCount: MAX_IMAGE_COUNT
                    }}
                  />
                </p>
              </div>
            )}
          </div>
          <DragDropContext onDragEnd={this.onDragEnd} className="d-flex pictures">
            <Droppable droppableId="droppable">
              {(provided) => (
                <div ref={provided.innerRef}>
                  {pictures.map((pic, idx) => (
                    <Draggable key={idx} draggableId={idx + 1} index={idx}>
                      {(provided) => (
                        <div
                          className="image-container"
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          <img src={
                              typeof pic === 'object' ?
                              pic.croppedImageUri :
                              pic
                            }
                          />
                          {typeof pic === 'object' &&
                            <a
                              className="re-crop-image image-overlay-btn"
                              aria-label="Re-Crop Image"
                              title={this.props.intl.formatMessage(this.intlMessages.reCropImage)}
                              onClick={() => this.reCropImage(pic, idx)}
                            >
                              <span aria-hidden="true">&#9635;</span>
                            </a>
                          }
                          <a
                            className="cancel-image image-overlay-btn"
                            aria-label="Delete Image"
                            title={this.props.intl.formatMessage(this.intlMessages.deleteImage)}
                            onClick={() => this.removePhoto(idx)}
                          >
                            <span aria-hidden="true">&times;</span>
                          </a>
                        </div>
                      )}
                    </Draggable>
                  ))}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>
      </Fragment>
    )
  }
}

export default injectIntl(PhotoPicker)
