import React, { Component } from 'react'

import Tooltip from 'components/Tooltip'
import ImageCropper from 'components/ImageCropperModal'

import loadImage from 'blueimp-load-image'

import { fileSize, postFile } from 'utils/fileUtils'
const acceptedFileTypes = ['image/jpeg', 'image/pjpeg', 'image/png']

import withConfig from 'hoc/withConfig'

async function getImages(ipfsRPC, files) {
  const newImages = []
  for (let i = 0; i < files.length; i++) {
    const file = files[i]

    const newFile = await new Promise(resolve => {
      loadImage(file, img => img.toBlob(blob => resolve(blob), 'image/jpeg'), {
        orientation: true,
        maxWidth: 2000,
        maxHeight: 2000
      })
    })

    const hash = await postFile(ipfsRPC, newFile, file.type)
    if (acceptedFileTypes.indexOf(file.type) >= 0) {
      newImages.push({
        contentType: file.type,
        size: fileSize(file.size),
        name: file.name,
        src: window.URL.createObjectURL(newFile),
        urlExpanded: window.URL.createObjectURL(newFile),
        hash
      })
    }
  }
  return newImages
}

class ImagePicker extends Component {
  constructor(props) {
    super(props)
    this.state = { images: this.imagesFromProps(props) }
  }

  imagesFromProps(props) {
    const { ipfsGateway } = props.config
    if (!ipfsGateway) return []
    return (props.images || []).map(image => {
      const hash = image.url.replace(/ipfs:\/\//, '')
      return {
        ...image,
        hash,
        src: `${ipfsGateway}/ipfs/${hash}`
      }
    })
  }

  componentDidUpdate(prevProps) {
    if (
      prevProps.images !== this.props.images ||
      prevProps.config.ipfsGateway !== this.props.config.ipfsGateway
    ) {
      this.setState({ images: this.imagesFromProps(this.props) })
    }
  }

  render() {
    const { ipfsRPC } = this.props.config
    return (
      <div className="image-picker">
        {this.renderPreview()}
        <label htmlFor="upload">
          {this.state.open ? null : (
            <input
              id="upload"
              type="file"
              ref={ref => (this.uploadRef = ref)}
              multiple={true}
              onChange={async e => {
                const { files } = e.currentTarget
                const newImages = await getImages(ipfsRPC, files)
                this.onChange([...this.state.images, ...newImages])
                this.uploadRef.value = ''
              }}
              style={{ display: 'none' }}
            />
          )}
          {this.props.children}
        </label>

        {this.state.crop === undefined ? null : (
          <ImageCropper
            src={this.state.images[this.state.crop].src}
            onClose={() => this.setState({ crop: undefined })}
            onChange={async imageBlob => {
              const [newImage] = await getImages(ipfsRPC, [imageBlob])
              const images = [...this.state.images]
              images[this.state.crop] = newImage
              this.onChange(images)
            }}
          />
        )}
      </div>
    )
  }

  onChange(images) {
    this.setState({ images })
    if (this.props.onChange) {
      const { ipfsGateway } = this.props.config
      this.props.onChange(
        images.map(i => ({
          url: `ipfs://${i.hash}`,
          urlExpanded: `${ipfsGateway}/ipfs/${i.hash}`,
          contentType: i.contentType
        }))
      )
    }
  }

  renderPreview() {
    const images = [...this.state.images]
    if (images.length === 0) return null

    const { dragging, dragTarget } = this.state

    if (typeof dragging === 'number' && typeof dragTarget === 'number') {
      images.splice(dragging, 1)
      images.splice(dragTarget, 0, this.state.images[dragging])
    }

    return images.map((image, idx) => (
      <div
        key={idx}
        className={`preview-row${dragTarget === idx ? ' dragging' : ''}`}
        draggable
        onDragEnd={() => {
          this.setState({ dragging: null, dragTarget: null })
          this.onChange(images)
        }}
        onDragEnter={() => this.setState({ dragTarget: idx })}
        onDragOver={e => e.preventDefault()}
        onDragStart={e => {
          if (e.target.className.match(/preview-row/)) {
            setTimeout(() => this.setState({ dragging: idx }))
          } else {
            e.preventDefault()
          }
        }}
      >
        <div className="img" style={{ backgroundImage: `url(${image.src})` }} />
        <div className="info">
          {/*image.size*/}
          <Tooltip tooltip="Crop" placement="top" delayShow={500}>
            <a
              href="#"
              className="crop"
              onClick={e => {
                e.preventDefault()
                this.setState({ crop: idx })
              }}
            />
          </Tooltip>
          <Tooltip tooltip="Remove" placement="top" delayShow={500}>
            <a
              href="#"
              onClick={e => {
                e.preventDefault()
                this.onChange(images.filter((i, offset) => idx !== offset))
              }}
              children="×"
            />
          </Tooltip>
        </div>
      </div>
    ))
  }
}

export default withConfig(ImagePicker)

require('react-styl')(`
  .image-picker
    margin-bottom: 1rem
    display: grid
    grid-column-gap: 1rem;
    grid-row-gap: 1rem;
    grid-template-columns: repeat(auto-fill,minmax(150px, 1fr));

    > label
      cursor: pointer
      margin: 0
    .preview-row
      position: relative
      background: var(--white)
      cursor: pointer
      border: 2px dashed transparent
      .info
        position: absolute
        top: 0
        right: 0
        background: rgba(255, 255, 255, 0.75)
        line-height: normal
        border-radius: 0 0 0 2px
        > a
          padding: 0 0.25rem
          font-weight: bold
          color: var(--dusk)
          &.crop
            opacity: 0.6;
            &::after
              content: ""
              width: 12px;
              height: 12px
              background: url(images/crop.svg) no-repeat center
              vertical-align: 0px;
              background-size: contain
              display: inline-block
            &:hover
              opacity: 1
          &:hover
            color: #000
            background: rgba(255, 255, 255, 0.85)
      .img
        background-position: center
        width: 100%
        padding-top: 66%
        background-size: contain
        background-repeat: no-repeat

      &.dragging
        .info
          visibility: hidden
        .img
          visibility: hidden
        border-color: var(--light-dusk)

`)
