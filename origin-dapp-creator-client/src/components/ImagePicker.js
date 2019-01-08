import React from 'react'

class ImagePicker extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      data: null,
      loading: false
    }

    this.handleFileChange = this.handleFileChange.bind(this)
    this.handleClearClick = this.handleClearClick.bind(this)
  }

  handleFileChange(event) {
    const { target } = event
    const { files } = target

    if (files && files[0]) {
      var reader = new FileReader();

      reader.onloadstart = () => this.setState({ loading: true })

      reader.onload = event => {
        this.setState({
          data: event.target.result,
          loading: false
        })
      }

      reader.readAsDataURL(files[0]);
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
          className="form-control-file"
          type="file"
          accept="image/*"
          onChange={this.handleFileChange}
        />

        <div
          className="image-picker"
          onClick={this.handlePreviewClick}
        >
          <p class="title">{this.props.title}</p>
          <p>{this.props.description}</p>
          <button className="btn btn-outline-primary">
            Upload
          </button>
        </div>
      </>
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
