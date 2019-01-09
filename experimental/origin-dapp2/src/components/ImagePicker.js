import React, { Component } from 'react'

const acceptedFileTypes = ['image/jpeg', 'image/pjpeg', 'image/png']

import withConfig from 'hoc/withConfig'

async function postFile(ipfsRPC, file) {
  const body = new FormData()
  body.append('file', file)
  const rawRes = await fetch(`${ipfsRPC}/api/v0/add`, { method: 'POST', body })
  const res = await rawRes.json()
  return res.Hash
}

function fileSize(number) {
  if (number < 1024) {
    return number + 'bytes'
  } else if (number >= 1024 && number < 100000) {
    return (number / 1024).toFixed(1) + 'KB'
  } else if (number >= 100000 && number < 1048576) {
    return (number / 1024).toFixed() + 'KB'
  } else if (number >= 1048576) {
    return (number / 1048576).toFixed(1) + 'MB'
  }
}

async function getImages(ipfsRPC, files) {
  const newImages = []
  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    const hash = await postFile(ipfsRPC, file, file.type)
    if (acceptedFileTypes.indexOf(file.type) >= 0) {
      newImages.push({
        contentType: file.type,
        size: fileSize(file.size),
        name: file.name,
        src: window.URL.createObjectURL(file),
        urlExpanded: window.URL.createObjectURL(file),
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
    return (props.media || []).map(image => {
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
      prevProps.media !== this.props.media ||
      prevProps.config.ipfsGateway !== this.props.config.ipfsGateway
    ) {
      this.setState({ images: this.imagesFromProps(this.props) })
    }
  }

  render() {
    const { ipfsRPC } = this.props.config
    return (
      <div className="image-picker">
        <label htmlFor="upload">
          {this.state.open ? null : (
            <input
              id="upload"
              type="file"
              onChange={async e => {
                const newImages = await getImages(
                  ipfsRPC,
                  e.currentTarget.files
                )
                const images = [...this.state.images, ...newImages]
                this.onChange(images)
              }}
              style={{ display: 'none' }}
            />
          )}
          {this.props.children}
        </label>
        {this.renderPreview()}
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
    if (this.state.images.length === 0) return null
    return (
      <div className="preview">
        {this.state.images.map((image, idx) => (
          <div key={idx} className="preview-row">
            <div
              className="img"
              style={{ backgroundImage: `url(${image.src})` }}
            />
            <div className="info">
              {image.size}
              <a
                href="#"
                onClick={e => {
                  e.preventDefault()
                  this.onChange(
                    this.state.images.filter((i, offset) => idx !== offset)
                  )
                }}
                children="X"
              />
            </div>
          </div>
        ))}
      </div>
    )
  }
}

export default withConfig(ImagePicker)

require('react-styl')(`
  .image-picker
    display: block
    > label
      cursor: pointer
    .preview
      margin-bottom: 1rem
      display: grid
      grid-column-gap: 10px;
      grid-row-gap: 10px;
      grid-template-columns: repeat(auto-fill,minmax(90px, 1fr));
    .preview-row
      font-size: 12px
      box-shadow: 0 0 0 0 rgba(19, 124, 189, 0), 0 0 0 0 rgba(19, 124, 189, 0), inset 0 0 0 1px rgba(16, 22, 26, 0.15), inset 0 1px 1px rgba(16, 22, 26, 0.2);
      background: #fff
      padding: 5px;
      .info
        display: flex
        justify-content: space-between
        margin-top: 5px
        padding-left: 2px
        align-items: center
      .img
        background-position: center
        width: 100%
        height: 80px
        background-size: contain
        background-repeat: no-repeat

`)
