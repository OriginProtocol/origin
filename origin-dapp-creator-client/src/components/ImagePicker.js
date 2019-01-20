import React from 'react'

const acceptedFileTypes = [
  'image/jpeg',
  'image/pjpeg',
  'image/png',
  'image/vnd.microsoft.icon',
  'image/x-icon',
  // Not valid but sometimes used for icons
  'image/ico',
  'image/icon',
]

class ImagePicker extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      imageUrl: null,
      loading: false
    }

    this.handleFileChange = this.handleFileChange.bind(this)
    this.handleClearClick = this.handleClearClick.bind(this)
  }

  async handleFileChange(event) {
    const { target } = event
    const { files } = target

    if (files && files[0]) {
      const file = files[0]

      if (acceptedFileTypes.indexOf(file.type) >= 0) {
        const body = new FormData()
        body.append('file', file)

        const rawRes = await fetch(
          `${process.env.IPFS_API_URL}/api/v0/add`,
          { method: 'POST', body }
        )

        const res = await rawRes.json()
        const hash = res.Hash

        const imageUrl = `${process.env.IPFS_API_URL}/ipfs/${hash}`

        this.setState({ imageUrl: imageUrl })

        if (this.props.onUpload) {
          this.props.onUpload(this.props.name, imageUrl)
        }
      } else {
        console.log('Invalid file type: ', file.type)
      }
    }
  }

  handleClearClick() {
    this.setState({ data: null })
  }

  render() {
    const { data, loading } = this.state

    return (
      <>
        <input
          id={this.props.name + '-picker'}
          className="form-control-file"
          type="file"
          accept="image/*"
          onChange={this.handleFileChange}
        />

        {this.state.imageUrl !== null ? this.renderPreview() :
          <div
            className="image-picker"
            onClick={this.handlePreviewClick}
          >
            <div className="upload-wrapper">
              <img src="images/upload-icon.svg" />
              <p className="title">{this.props.title}</p>
              <p>{this.props.description.map((x, i) => <span key={i}>{x}</span>)}</p>
            </div>
            <label htmlFor={this.props.name + '-picker'} className="btn btn-outline-primary">
              Upload
            </label>
          </div>
        }
      </>
    )
  }

  renderPreview () {
    return (
      <div className="preview">
        <div className="upload-wrapper">
          <img src={this.state.imageUrl} />
        </div>
        <label htmlFor={this.props.name + '-picker'} className="btn btn-outline-primary">
          Change
        </label>
      </div>
    )
  }
}

require('react-styl')(`
  .upload-wrapper
    position: relative
    background-color: var(--pale-grey-four)

  .image-picker, .preview
    text-align: center;

  .image-picker
    padding: 2rem
    border: 1px dashed var(--light)
    border-radius: var(--default-radius)
    background-color: var(--pale-grey-four)

  .image-picker img
    margin-bottom: 0.25rem

  .preview
    label
      margin-top: 2rem
    img
      max-width: 100%
      position: absolute
      margin: auto
      top: 0
      bottom: 0
      left: 0
      right: 0

  .title
    color: var(--dark)
    font-size: 1.125rem

  .form-control-file
    width: 1px
    height: 1px
    opacity: 0
    position: absolute
    overflow: hidden
    z-index: -1
`)

export default ImagePicker
