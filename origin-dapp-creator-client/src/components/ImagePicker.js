import React from 'react'

const acceptedFileTypes = [
  'image/jpeg',
  'image/pjpeg',
  'image/png',
  'image/ico'
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

        const rawRes = await fetch(`${process.env.IPFS_API_URL}/api/v0/add`, { method: 'POST', body })
        const res = await rawRes.json()
        const hash = res.Hash

        const imageUrl = `${process.env.IPFS_API_URL}/ipfs/${hash}`

        this.setState({ imageUrl: imageUrl })

        if (this.props.onUpload) {
          this.props.onUpload(this.props.name, imageUrl)
        }
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

        {this.renderPreview()}

        <div
          className="image-picker"
          onClick={this.handlePreviewClick}
        >
          <img src="images/upload-icon.svg" />
          <p className="title">{this.props.title}</p>
          <p>{this.props.description.map((x, i) => <span key={i}>{x}</span>)}</p>
          <label htmlFor={this.props.name + '-picker'} className="btn btn-outline-primary">
            Upload
          </label>
        </div>
      </>
    )
  }

  renderPreview () {
    if (this.state.imageUrl === null) return null
    return (
      <div className="preview">
        <div className="img"
          style={{ backgroundImage: `url(${this.state.imageUrl})` }}>
        </div>
      </div>
    )
  }
}

require('react-styl')(`
  .image-picker
    border: 1px dashed var(--light)
    border-radius: var(--default-radius)
    background-color: var(--pale-grey-four)
    padding: 2rem
    text-align: center;

  .image-picker img
    margin-bottom: 0.25rem

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

  .preview
    width: 100%
    height: 100%;

  .img
    width: 100%
    height: 100%;
    background-repeat: no-repeat
    background-size:contain
`)

export default ImagePicker
