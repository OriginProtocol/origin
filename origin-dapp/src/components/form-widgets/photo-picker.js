import React, { Component, Fragment } from 'react'
import { FormattedMessage } from 'react-intl'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import ImageCropper from '../modals/image-cropper'
import { getDataUri } from 'utils/fileUtils'

const MAX_IMAGE_COUNT = 10

class PhotoPicker extends Component {
  constructor(props) {
    super(props)
    this.state = {
      imageFileObj: null,
      showCropModal: false,
      pictures: props.value,
      showMaxImageCountMsg: false
    }

    this.onFileSelected = this.onFileSelected.bind(this)
    this.onCropComplete = this.onCropComplete.bind(this)
    this.onCropCancel = this.onCropCancel.bind(this)
    this.onDragEnd = this.onDragEnd.bind(this)
  }

  componentDidMount() {
    // If a pictures array is passed in, we must call the onChange callback
    // to set the pictures array in the parent form
    // Unfortunately, the setTimeout is needed to allow the parent
    // form to render and be ready to handle the onChange event
    const { pictures } = this.state
    if (pictures) {
      setTimeout(async () => {
        const picDataURIs = await this.getDataURIsFromImgURLs(pictures)
        this.props.onChange(picDataURIs)
      })
    }
  }

  async getDataURIsFromImgURLs(picUrls) {
    const imagePromises = picUrls.map(url => {
      return new Promise(async resolve => {
        const image = new Image()
        image.crossOrigin = 'anonymous' 

        image.onload = function() {
          const canvas = document.createElement('canvas')
          canvas.width = this.naturalWidth
          canvas.height = this.naturalHeight
          canvas.getContext('2d').drawImage(this, 0, 0)
          canvas.toBlob(file => {
            resolve(getDataUri(file))
          }, 'image/jpeg')
        }

        image.src = url
      })
    })

    return Promise.all(imagePromises)
  }

  async onFileSelected(e) {
    if (e.target.files && e.target.files.length > 0) {
      const imageFileObj = e.target.files[0]

      this.setState({
        imageFileObj: imageFileObj,
        showCropModal: true
      })
    }
  }

  onCropComplete(croppedImageUrl) {
    const imgInput = document.getElementById('photo-picker-input')
    const pictures = [...this.state.pictures, croppedImageUrl]
    let showMaxImageCountMsg = false

    if (pictures.length >= MAX_IMAGE_COUNT) {
      showMaxImageCountMsg = true
    }

    this.setState(
      {
        pictures,
        showMaxImageCountMsg,
        showCropModal: false,
      },
      () => this.props.onChange(pictures)
    )

    imgInput.value = null
  }

  onCropCancel() {
    this.setState({ showCropModal: false })
  }

  removePhoto(indexToRemove) {
    this.setState({
      pictures: this.state.pictures.filter(
        (picture, idx) => idx !== indexToRemove
      ),
      showMaxImageCountMsg: false
    })
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
      imageFileObj
    } = this.state

    return (
      <Fragment>
        {showCropModal &&
          <ImageCropper
            isOpen={showCropModal}
            imageFileObj={imageFileObj}
            onCropComplete={this.onCropComplete}
            onCropCancel={this.onCropCancel}
          />
        }
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
          />
          <p className="help-block">
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
                  {pictures.map((dataUri, idx) => (
                    <Draggable key={idx} draggableId={idx + 1} index={idx}>
                      {(provided) => (
                        <div
                          className="image-container"
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          <img src={dataUri} />
                          <a
                            className="cancel-image"
                            aria-label="Close"
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

export default PhotoPicker
